window.chartJSObjects = {}
window.chartJSWrapperPlugin = class checkContext {
  async init (element, selector) {
    while (document.querySelector(selector) === null) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return document.querySelector(selector);
  };

  createGradient (gradientJson, chartContext) {
    if (gradientJson.isGradient) {
      var gradient = chartContext.createLinearGradient(0, 0, 0, 400);

      for (let i = 0; i < gradientJson.gradient.length; i++) {
        const g = gradientJson.gradient[i];
        gradient.addColorStop(g.stop, g.color);
      }

      return gradient;
    }
    return gradientJson;
  }

  showChart (chartId, config, formatTooltip) {
    config = JSON.parse(config);

    if (formatTooltip) {
      var tooltipCallback = {
        label: (tooltipItem, data) => {
          var tItem = JSON.stringify(tooltipItem);
          return formatTooltip(tItem, null);
        }
      }

      if (config.options['tooltips']) {
        config.options['tooltips']['callbacks'] = tooltipCallback;
      }
    }

    var createGradient = this.createGradient;
    var init = this.init;
    init(document, "flt-platform-view").then(e => {
      var platformViews = document.querySelectorAll("flt-platform-view");
      for (let i = 0; i < platformViews.length; i++) {
        const platformView = platformViews[i];
        init(platformView.shadowRoot, "#" + chartId).then(chart => {
          var _chartContext = chart.getContext("2d");
  
          config.data.datasets.forEach(element => {
            if (element.backgroundColor) {
              element.backgroundColor = createGradient(
                element.backgroundColor,
                _chartContext
              );
            }
  
            if (element.borderColor) {
              element.borderColor = createGradient(
                element.borderColor,
                _chartContext
              );
            }
          });
  
          if (config.options) {
            if (config.options.scales) {
              if (config.options.scales.xAxes) {
                config.options.scales.xAxes.forEach(element => {
                  if (element.ticks) {
                    if (element.ticks.format) {
                      element.ticks.callback = function (value, index, values) {
                        return element.ticks.format.replace("{value}", value);
                      };
                    }
                  }
                });
              }
  
              if (config.options.scales.yAxes) {
                config.options.scales.yAxes.forEach(element => {
                  if (element.ticks) {
                    if (element.ticks.format) {
                      element.ticks.callback = function (value, index, values) {
                        return element.ticks.format.replace("{value}", value);
                      };
                    }
                  }
                });
              }
            }
          }
  
          if (window.chartJSObjects[chartId] != null) window.chartJSObjects[chartId].destroy();
          window.chartJSObjects[chartId] = new Chart(_chartContext, config);
        });
      }
    });
  }

}
