const DEFAULT_API = "https://app.simplelogin.io";

function getInitialData() {
  const isFirefox = typeof InstallTrigger !== "undefined",
    isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
    firefoxExtensionUrl =
      "https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/",
    chromeExtensionUrl =
      "https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn";
  const extensionUrl = isFirefox ? firefoxExtensionUrl : chromeExtensionUrl;
  return {
    loading: false,
    apiUrl: DEFAULT_API,

    // API key
    apiKey: "",
    apiInput: "",

    // hostName obtained from chrome tabs query
    hostName: "",

    // new alias is saved here: a new alias screen will be shown
    newAlias: "",

    // only show options when GET /alias/options returns
    optionsReady: false,

    // for recommendation section
    hasRecommendation: false,
    recommendation: {},

    // alias info
    aliasPrefix: "",
    signedSuffix: "",
    aliasSuffixes: [],
    canCreate: false,

    existing: [],

    aliasQuery: "",
    loadMoreAlias: false,

    extensionUrl: extensionUrl,

    notAskingRate: false,
    showVoteScreen: false
  };
}

export default {
  data() {
    return getInitialData();
  },
  async mounted() {
    let that = this;
    chrome.storage.sync.get("apiKey", async function(data) {
      that.apiKey = data.apiKey || "";
      that.apiInput = that.apiKey || "";

      that.hostName = await that.getHostName();

      if (that.apiKey != "") that.getAliasOptions();
    });

    chrome.storage.sync.get("apiUrl", function(data) {
      that.apiUrl = data.apiUrl || DEFAULT_API;
    });

    chrome.storage.sync.get("notAskingRate", function(data) {
      that.notAskingRate = data.notAskingRate || false;
    });
  },
  methods: {
    async save() {
      let that = this;
      if (this.apiInput === "") {
        that.showError("API Key cannot be empty");
        return;
      }

      chrome.storage.sync.set({ apiKey: this.apiInput }, function() {
        chrome.storage.sync.get("apiKey", function(data) {
          that.$toasted.show("API Key set successfully", { type: "success" });
          that.apiKey = data.apiKey;

          that.getAliasOptions();
        });
      });
    },
    async reset() {
      let that = this;
      chrome.storage.sync.set(
        { apiKey: "", notAskingRate: false },
        async function() {
          that.apiKey = "";
          that.apiInput = "";
          that.notAskingRate = false;

          Object.assign(that.$data, getInitialData());
          that.hostName = await that.getHostName();
          chrome.storage.sync.get("apiUrl", function(data) {
            that.apiUrl = data.apiUrl || DEFAULT_API;
          });
        }
      );
    },
    async backToOptionPage() {
      this.newAlias = "";
      this.optionsReady = false;
      this.getAliasOptions();
    },

    async getAliasOptions() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        that.apiUrl + "/api/v4/alias/options?hostname=" + that.hostName,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        }
      );

      let json = await res.json();

      if (res.status == 401) {
        that.showError(
          "Invalid API Key. Please logout and re-setup the API Key"
        );
        that.loading = false;
        return;
      } else if (res.status >= 500) {
        that.showError("Unknown error. We are sorry for this inconvenience!");
        that.loading = false;
        return;
      }

      if (json.recommendation !== undefined) {
        that.hasRecommendation = true;
        that.recommendation = json.recommendation || {};
      }

      that.aliasSuffixes = json.suffixes;
      that.signedSuffix = that.aliasSuffixes[0][1];
      that.aliasPrefix = json.prefix_suggestion;
      that.canCreate = json.can_create;

      that.optionsReady = true;
      that.loading = false;

      that.loadAlias();
    },

    async resetSearch() {
      this.aliasQuery = "";
      this.loadAlias();
    },

    async loadAlias() {
      let that = this;
      that.existing = [];
      that.loadMoreAlias = true;

      let currentPage = 0;
      that.existing = await that.getAliases(currentPage, that.aliasQuery);
      that.loadMoreAlias = false;

      let allAliasesAreLoaded = false;

      window.onscroll = async function() {
        if (allAliasesAreLoaded)
          // nothing to do
          return;

        let bottomOfWindow =
          document.documentElement.scrollTop + window.innerHeight ===
          document.documentElement.offsetHeight;

        if (bottomOfWindow) {
          console.log("reach button, load more alias");
          currentPage += 1;

          that.loadMoreAlias = true;
          let newAliases = await that.getAliases(currentPage, that.aliasQuery);
          that.loadMoreAlias = false;

          allAliasesAreLoaded = newAliases.length === 0;
          that.existing = mergeAliases(that.existing, newAliases);
        }
      };
    },

    async getAliases(page, query) {
      let that = this;

      let res = await fetch(that.apiUrl + `/api/aliases?page_id=${page}`, {
        method: "POST",
        body: JSON.stringify({
          query: query
        }),
        headers: {
          "Content-Type": "application/json",
          Authentication: this.apiKey
        }
      });

      let json = await res.json();
      return json.aliases;
    },

    async createCustomAlias() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        that.apiUrl + "/api/v2/alias/custom/new?hostname=" + that.hostName,
        {
          method: "POST",
          body: JSON.stringify({
            alias_prefix: that.aliasPrefix,
            signed_suffix: that.signedSuffix
          }),
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        }
      );

      let json = await res.json();
      that.loading = false;
      if (res.status == 201) {
        that.newAlias = json.alias;
        that.recomputeShowVoteScreen();
      } else {
        that.showError(json.error);
      }
    },

    async createRandomAlias() {
      let that = this;
      that.loading = true;

      let res = await fetch(
        that.apiUrl + "/api/alias/random/new?hostname=" + that.hostName,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authentication: this.apiKey
          }
        }
      );

      let json = await res.json();
      that.loading = false;
      if (res.status == 201) {
        that.newAlias = json.alias;
        that.recomputeShowVoteScreen();
      } else {
        that.showError(json.error);
      }
    },

    showError(msg) {
      this.$toasted.show(msg, {
        type: "error",
        duration: 3000,
        action: {
          text: "x",
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        }
      });
    },

    gotoSetting() {
      this.$modal.show("setting-modal");
    },

    async saveApiUrl() {
      let that = this;
      chrome.storage.sync.set({ apiUrl: that.apiUrl }, async function() {
        chrome.storage.sync.get("apiUrl", function(data) {
          that.$toasted.show("API URL saved successfully", { type: "success" });
          that.$modal.hide("setting-modal");
          that.apiUrl = data.apiUrl;
        });
      });
    },

    async doNotAskRateAgain() {
      let that = this;

      chrome.storage.sync.set({ notAskingRate: true }, function() {
        chrome.storage.sync.get("notAskingRate", function(data) {
          that.$toasted.show("Your preference has been saved", {
            type: "success"
          });
          that.notAskingRate = true;
          that.recomputeShowVoteScreen();
        });
      });
    },

    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      this.$toasted.show(value + " copied to clipboard", {
        type: "success",
        duration: 2500
      });
    },

    clipboardErrorHandler({ value, event }) {
      console.log("error", value);
    },

    async getHostName() {
      try {
        var result = await this.$browser.tabs.query({
          active: true,
          currentWindow: true
        });
        var url = new URL(result[0].url);
        return url.hostname;
      } catch (error) {
        console.log(error);
      }
    },

    recomputeShowVoteScreen() {
      if (this.notAskingRate) this.showVoteScreen = false;
      else this.showVoteScreen = getRandomInt(10) % 2 == 0;
    }
  },
  computed: {}
};

// merge newAliases into currentAliases. If conflict, keep the new one
function mergeAliases(currentAliases, newAliases) {
  // dict of aliasId and alias to speed up research
  let newAliasesDict = {};
  for (var i = 0; i < newAliases.length; i++) {
    let alias = newAliases[i];
    newAliasesDict[alias.id] = alias;
  }

  let ret = [];

  // keep track of added aliases
  let alreadyAddedId = {};
  for (var i = 0; i < currentAliases.length; i++) {
    let alias = currentAliases[i];
    if (newAliasesDict[alias.id]) ret.push(newAliasesDict[alias.id]);
    else ret.push(alias);

    alreadyAddedId[alias.id] = true;
  }

  for (var i = 0; i < newAliases.length; i++) {
    let alias = newAliases[i];
    if (!alreadyAddedId[alias.id]) {
      ret.push(alias);
    }
  }

  return ret;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}