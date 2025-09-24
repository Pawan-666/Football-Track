import GObject from "gi://GObject";
import St from "gi://St";
import Gio from "gi://Gio";

import Clutter from "gi://Clutter";
import Soup from "gi://Soup";
import GLib from "gi://GLib";
import { compitionsData } from "./data.js";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

let RefreshTime = 15;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(settings, path) {
      super._init(0.0, _("My Shiny Indicator"));
      this._settings = settings;
      this._icon = new St.Icon({ style_class: "system-status-icon" });
      this._icon.gicon = Gio.icon_new_for_string(`${path}/icons/football.svg`);
      this.add_child(this._icon);
      this._session = new Soup.Session();

      this.parent_container = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
      });

      this.parent_container.set_vertical(true);

      this.standings = {};

      this.fixtures = { data: [] };

      this.results = { data: [] };


      this.compitions = compitionsData.map((comp, index) => ({
        ...comp,
        active: index === 0
      }));

      this.tabs = [
        { name: "Table", active: true },
        { name: "Fixtures", active: false },
        { name: "Results", active: false },
      ];

      this._refreshUI();
      this.menu.addMenuItem(this.parent_container);
    }

    _refreshUI() {
      this.parent_container?.destroy_all_children();

      const compition_layout = new St.BoxLayout({
        x_expand: true,
        style: "padding: 4px; border: 1px solid white;",
      });

      this.compitions.forEach((comp) => {
        const compButton = new St.Button({
          label: comp.name,
          style_class: `tabs`,
          x_expand: true,
          style: `padding:6px;text-align:center; border-right: 1px solid white; ${
            comp.active ? "background-color: white; color: black" : ""
          }`,
        });
        compButton.connect("clicked", () => {
          this.tabs = [
            { name: "Table", active: true },
            { name: "Fixtures", active: false },
            { name: "Results", active: false },
          ];
          this.compitions = this.compitions.map((c) => {
            return {
              name: c.name,
              active: c.name == comp.name,
              compId: c.compId,
            };
          });
          this._refreshUI();
        });

        compition_layout.add_child(compButton);
      });

      const tabs_layout = new St.BoxLayout({
        x_expand: true,
        style: "padding: 4px; border: 1px solid white;",
      });

      this.tabs.forEach((tab) => {
        const tabsButton = new St.Button({
          label: tab.name,
          style_class: `tabs`,
          style: `padding:6px;text-align:center; border-right: 1px solid white;
             ${tab.active ? "background-color: white; color: black" : ""}`,
          x_expand: true,
        });
        tabsButton.connect("clicked", () => {
          this.tabs = this.tabs.map((t) => {
            return { name: t.name, active: t.name == tab.name };
          });

          this._refreshUI();
        });

        tabs_layout.add_child(tabsButton);
      });

      this.parent_container.add_child(compition_layout);
      this.parent_container.add_child(tabs_layout);

      let activeTab = this.tabs.find((tab) => tab.active);
      const loadingLabel = new St.Label({
        text: "Loading ....",
        x_expand: true,
        style:
          "font-weight: bold; font-size: 16px; text-align: center; padding: 40px 10px;",
      });
      this.parent_container.add_child(loadingLabel);
      if (activeTab.name === "Table") {
        this._populateStanding(loadingLabel);
      } else if (activeTab.name == "Fixtures") {
        this._populateFixture(loadingLabel);
      } else {
        this._populateResults(loadingLabel);
      }
    }

    _buildFixtures(activeCompName) {
      let _this = this;

      const fixtures_layout = new St.BoxLayout();
      fixtures_layout.set_vertical(true);
      let games = this.fixtures[activeCompName].data.reduce((acc, curr) => {
        let curDate = new Date(curr.startTime).toLocaleDateString();
        if (curDate == new Date().toLocaleDateString()) {
          curDate = "Today";
        } else if (
          curDate ==
          new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
        ) {
          curDate = "Tomorrow";
        }
        if (typeof acc[curDate] == "undefined") acc[curDate] = [];
        acc[curDate].push({
          teamA: curr.homeCompetitor.name,
          teamB: curr.awayCompetitor.name,
          startTime: curr.startTime,
          scoreA: curr.homeCompetitor.score,
          scoreB: curr.awayCompetitor.score,
          displayTime: curr.gameTimeDisplay,
          id: String(curr.id),
        });

        return acc;
      }, {});

      Object.keys(games).forEach((date) => {
        const dateLabel = new St.Label({
          text: date,
          x_expand: true,
          style:
            "font-weight: bold; font-size: 16px; text-align: center; border:1px solid white;",
        });

        fixtures_layout.add_child(dateLabel);

        games[date].forEach((match) => {
          const menuItem = new St.BoxLayout();

          const card = new St.BoxLayout({
            x_expand: true,
            style: "padding: 10px; margin: 5px; width: 380px;",
          });

          const teamContainer = new St.BoxLayout({});
          const timeContainer = new St.BoxLayout({
            style: "margin-bottom: 10px;",
          });

          let isRunning =
            new Date(match.startTime) - new Date() < 0 ? true : false;

          const timeLabel = new St.Label({
            text: new Date(match.startTime).toLocaleTimeString(),
            x_expand: true,
            style: "padding-bottom: 2px;text-align:center; width: 80%",
          });

          timeContainer.add_child(timeLabel);

          const teamALabel = new St.Label({
            text: match.teamA,
            x_expand: true,
            style:
              "font-weight: bold; font-size: 14px; text-align: left; width: 120px;",
          });
          ``;

          let scoreTxt = isRunning ? `${match.scoreA} : ${match.scoreB}` : "vs";
          const vsLabel = new St.Label({
            text: scoreTxt,
            x_expand: true,
            style: `font-weight: bold; margin: 0 10px; text-align: center; width: 120px; font-size: ${
              isRunning ? "16px" : "14px"
            }; `,
          });

          const teamBLabel = new St.Label({
            text: match.teamB,
            x_expand: true,
            style:
              "font-weight: bold; font-size: 14px; text-align: right; width: 120px;",
          });

          teamContainer.add_child(teamALabel);
          teamContainer.add_child(vsLabel);
          teamContainer.add_child(teamBLabel);

          card.set_vertical(true);

          card.add_child(timeContainer);
          card.add_child(teamContainer);

          menuItem.add_child(card);
          fixtures_layout.add_child(menuItem);
        });
      });

      const scrollView = new St.ScrollView({
        style: "max-height: 300px;",
      });

      scrollView.add_child(fixtures_layout);
      this.parent_container.add_child(scrollView);
    }

    _buildStandings(activeCompName) {
      let table = new St.Widget({
        layout_manager: new Clutter.GridLayout(),
        x_expand: true,
        style:
          "border: 1px solid white; padding: 6px; margin: 6px; min-width: 380px;",
      });

      function makeCell(text, first, bold = false) {
        return new St.Label({
          text,
          x_expand: true,
          style: `padding: 6px; ${bold ? "font-weight: bold;" : ""} `,
        });
      }

      let headers = ["Team", "P", "W", "D", "L", "Pts"];
      headers.forEach((head, i) => {
        table.layout_manager.attach(makeCell(head, i === 0, true), i, 0, 1, 1);
      });

      let rows = this.standings[activeCompName].data.map((d) => [
        `${String(d.position)}) ${String(d.competitor.name)}`,
        String(d.gamePlayed),
        String(d.gamesWon),
        String(d.gamesEven),
        String(d.gamesLost),
        String(d.points),
      ]);

      rows.forEach((row, rIndex) => {
        row.forEach((col, cIndex) => {
          table.layout_manager.attach(
            makeCell(col, cIndex === 0),
            cIndex,
            rIndex + 1,
            1,
            1
          );
        });
      });
      const scrollView = new St.ScrollView({
        style: "max-height: 300px;",
      });
      let tableContainer = new St.BoxLayout();

      tableContainer.add_child(table);
      scrollView.add_child(tableContainer);
      this.parent_container.add_child(scrollView);
    }

    _fetchUrl(url, callback) {
      // let session = new Soup.Session();

      let message = Soup.Message.new("GET", url);

      this._session.send_and_read_async(
        message,
        GLib.PRIORITY_DEFAULT,
        null,
        (session, res) => {
          try {
            let bytes = session.send_and_read_finish(res);
            let data = new TextDecoder().decode(bytes.get_data());

            callback(null, data);
          } catch (e) {
            callback(e, null);
          }
        }
      );
    }

    _populateFixture(loadingLabel) {
      let activeComp = this.compitions.find((comp) => comp.active);

      if (
        this.fixtures[activeComp.name] &&
        (new Date() - this.fixtures[activeComp.name].fetchTime) / 1000 / 60 <
          RefreshTime
      ) {
        this._buildFixtures(activeComp.name);
        this.parent_container.remove_child(loadingLabel);
        return;
      }

      this._fetchUrl(
        `https://webws.365scores.com/web/games/fixtures/?timezoneName=Asia/Kathmandu&competitions=${activeComp.compId}`,
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            if (!this.fixtures[activeComp.name]) {
              loadingLabel.set_text("Error Loading data");
            } else {
              loadingLabel.get_parent() &&
                this._buildFixtures(activeComp.name);

              loadingLabel.get_parent() &&
                this.parent_container.remove_child(loadingLabel);
            }
            return;
          }

          this.fixtures[activeComp.name] = {
            fetchTime: new Date(),
            data: JSON.parse(data).games,
          };
          loadingLabel.get_parent() && this._buildFixtures(activeComp.name);
          loadingLabel.get_parent() &&
            this.parent_container.remove_child(loadingLabel);
        }
      );
    }

    _buildResults(activeCompName) {
      let _this = this;

      const results_layout = new St.BoxLayout();
      results_layout.set_vertical(true);
      let games = this.results[activeCompName].data.reduce((acc, curr) => {
        let curDate = new Date(curr.startTime).toLocaleDateString();
        if (curDate == new Date().toLocaleDateString()) {
          curDate = "Today";
        } else if (
          curDate ==
          new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
        ) {
          curDate = "Tomorrow";
        }
        if (typeof acc[curDate] == "undefined") acc[curDate] = [];
        acc[curDate].push({
          teamA: curr.homeCompetitor.name,
          teamB: curr.awayCompetitor.name,
          aScore: curr.homeCompetitor.score,
          bScore: curr.awayCompetitor.score,
          startTime: curr.startTime,
          id: String(curr.id),
        });

        return acc;
      }, {});

      Object.keys(games).forEach((date) => {
        const dateLabel = new St.Label({
          text: date,
          x_expand: true,
          style:
            "font-weight: bold; font-size: 16px; text-align: center; border:1px solid white;",
        });

        results_layout.add_child(dateLabel);

        games[date].forEach((match) => {
          const menuItem = new St.BoxLayout();

          const card = new St.BoxLayout({
            x_expand: true,
            style: "padding: 10px; margin: 5px; width: 380px;",
          });

          const teamContainer = new St.BoxLayout({});
          const timeContainer = new St.BoxLayout({
            style: "margin-bottom: 10px;",
          });

          const timeLabel = new St.Label({
            text: new Date(match.startTime).toLocaleTimeString(),
            x_expand: true,
            style: "padding-bottom: 2px;text-align:center; width: 80%",
          });

          timeContainer.add_child(timeLabel);

          const teamALabel = new St.Label({
            text: match.teamA,
            x_expand: true,
            style:
              "font-weight: bold; font-size: 14px; text-align: left; width: 120px;",
          });

          const vsLabel = new St.Label({
            text: `${match.aScore} : ${match.bScore}`,
            x_expand: true,
            style:
              "font-weight: bold; font-size: 16px; margin: 0 10px; text-align: center; width: 120px;",
          });

          const teamBLabel = new St.Label({
            text: match.teamB,
            x_expand: true,
            style:
              "font-weight: bold; font-size: 14px; text-align: right; width: 120px;",
          });

          teamContainer.add_child(teamALabel);
          teamContainer.add_child(vsLabel);
          teamContainer.add_child(teamBLabel);

          card.set_vertical(true);

          card.add_child(timeContainer);
          card.add_child(teamContainer);

          menuItem.add_child(card);
          results_layout.add_child(menuItem);
        });
      });

      const scrollView = new St.ScrollView({
        style: "max-height: 300px;",
      });

      scrollView.add_child(results_layout);
      this.parent_container.add_child(scrollView);
    }

    _populateResults(loadingLabel) {
      let activeComp = this.compitions.find((comp) => comp.active);

      if (
        this.results[activeComp.name] &&
        (new Date() - this.results[activeComp.name].fetchTime) / 1000 / 60 <
          RefreshTime
      ) {
        this._buildResults(activeComp.name);
        this.parent_container.remove_child(loadingLabel);
        return;
      }

      this._fetchUrl(
        `https://webws.365scores.com/web/games/results/?timezoneName=Asia/Kathmandu&competitions=${activeComp.compId}`,
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            if (!this.results[activeComp.name]) {
              loadingLabel.set_text("Error Loading data");
            } else {
              loadingLabel.get_parent() &&
                this._buildResults(activeComp.name);

              loadingLabel.get_parent() &&
                this.parent_container.remove_child(loadingLabel);
            }
            return;
          }

          this.results[activeComp.name] = {
            fetchTime: new Date(),
            data: JSON.parse(data).games,
          };
          loadingLabel.get_parent() && this._buildResults(activeComp.name);

          loadingLabel.get_parent() &&
            this.parent_container.remove_child(loadingLabel);
        }
      );
    }

    ///////////////////

    _populateStanding(loadingLabel) {
      let activeComp = this.compitions.find((comp) => comp.active);

      if (
        this.standings[activeComp.name] &&
        (new Date() - this.standings[activeComp.name].fetchTime) / 1000 / 60 <
          RefreshTime
      ) {
        this._buildStandings(activeComp.name);
        this.parent_container.remove_child(loadingLabel);
        return;
      }

      this._fetchUrl(
        `https://webws.365scores.com/web/standings/?timezoneName=Asia/Kathmandu&competitions=${activeComp.compId}`,
        (err, data) => {
          if (err) {
            console.log("Error: ", err);
            if (!this.standings[activeComp.name]) {
              loadingLabel.set_text("Error Loading data");
            } else {
              loadingLabel.get_parent() &&
                this._buildStandings(activeComp.name);

              loadingLabel.get_parent() &&
                this.parent_container.remove_child(loadingLabel);
            }
            return;
          }
          this.standings[activeComp.name] = {
            fetchTime: new Date(),
            data: JSON.parse(data).standings[0].rows,
          };
          loadingLabel.get_parent() && this._buildStandings(activeComp.name);
          loadingLabel.get_parent() &&
            this.parent_container.remove_child(loadingLabel);
        }
      );
    }



    destroy() {

      if (this._session) {
        this._session.abort();
        this._session = null;
      }

      this._settings = null;
      super.destroy();
    }
  }
);

export default class FootballTrack extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._indicator = new Indicator(this._settings, this.path);
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();

    this._indicator = null;
    this._settings = null;
  }
}
