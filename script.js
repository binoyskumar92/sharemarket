//Autocomplete
globalCtrl = autoCompleteController;
angular
    .module('autocompletemodule', ['ngMaterial', 'ngSanitize', 'ui.toggle'])
    .controller('autoCompleteController', autoCompleteController);

function autoCompleteController($timeout, $q, $log) {
 
    self = this;
    //Jquery
    //    $(document).ready(function () {
    //    $('#id_symbol').keydown(function () {
    //        if (jQuery.trim($('#id_symbol').val()) == ''){
    //            $('#id_symbol').css('border-color', 'red');
    //            $("#id_validationlabel")[0].innerHTML = "Please enter a stock ticker symbol.";
    //        } else {
    //            $("#id_validationlabel")[0].innerHTML = "";
    //        }
    //    });
    //    $("#id_quote").click(function () {
    //        if (jQuery.trim($('#id_symbol').val()) == '') {
    //            $('#id_symbol').css('border-color', 'red !important');
    //            $("#id_validationlabel")[0].innerHTML = "Please enter a stock ticker symbol.";
                
    //        }
    //        else {
    //            $('#id_symbol').css('border-color', '');
    //        }   
    //    });
    //});
    self.simulateQuery = true;
    self.isDisabled = false;
    self.afavItemsinStorage = readAllFromStorage();
    self.sortOptions = [
        { name: 'Default', value: 'default' },
        { name: 'Symbol', value: 'symbol' },
        { name: 'Price', value: 'stockprice' },
        { name: 'Change', value: 'change' },
        { name: 'Change Percent', value: 'changeperc' },
        { name: 'Volume', value: 'volume' }
    ];
    self.sort = { type: self.sortOptions[0].value };
    self.orderOptions = [{ name: 'Ascending', value: 'asc' },
        { name: 'Descending', value: 'desc' }];
    self.order = { type: self.orderOptions[0].value };

    // list of states to be displayed
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;

    self.aIndicatorData = {};
    self.getQuote = getQuote;
    self.getRemoteData = getRemoteData;
    self.setPriceVolumeGraph = setPriceVolumeGraph;
    self.loadIndicatorChart = loadIndicatorChart;
    self.addArrow = addArrow;
    self.fbShare = fbShare;
    self.favButtonClick = favButtonClick;
    self.getInt = getInt;
    self.getLocaleString = getLocaleString;
    self.toggleValue = false;
    self.toggleValueChanged = toggleValueChanged;
    self.manualRefresh = manualRefresh;

    //localstorage methods
    self.addToStorage = addToStorage;
    self.removeFromStorage = removeFromStorage;
    self.updateToStorage = updateToStorage;
    self.readFromStorage = readFromStorage;
    self.readAllFromStorage = readAllFromStorage;

    self.toggleButton = "";
    self.favDelete = favDelete;
    self.symbolLinkClick = symbolLinkClick;
    self.link = "#id_highchartgraph";
    self.link_highstock = "#highstock";
    self.setHighStocks = setHighStocks;
    self.favItems = {};
    self.showFull = true;
    self.showGetQuote = false;
    self.clearPress = clearPress;
    self.clearButtonpressed = 

    self.showPrgStockDetails = false;
    self.showPrgIndicator = false;
    self.showPrgHighStock = false;
    self.showPrgNews = false;

    self.showErrorStockDetails = false;
    self.showErrorIndicator = false;
    self.showErrorHighStock = false;
    self.showErrorNews = false;
    self.showNoProgress = true;
    self.aNewsArr = [];
    aTimeSeries = [];
    aChart = "";
    favClicked = true;
    iTimeInterval = 0;

    function clearPress() {
        self.clearButtonpressed=true;
        $("#id_validationlabel")[0].innerHTML = "";
        self.searchText = "";
        self.showGetQuote = false;
        self.showFull = true;
    }

    function manualRefresh() {
        getRefreshedData();
    }
    function toggleValueChanged() {
        var that = this;
        if (this.toggleValue) {
            var oItems = this.readAllFromStorage();
            if (!!oItems.length) {
                iTimeInterval = setInterval(getRefreshedData , 5000);
            }
        }else {
            clearInterval(iTimeInterval);
        }
    }
    function getRefreshedData() {
        var oItems = this.self.readAllFromStorage();
        var sTimeSeries = "Time Series (Daily)", iPrice, iChange, iChangePerc, iVolume, dCurrDate, dPrevDate;
            for (var i = 0; i < oItems.length; i++) {
                self.getRemoteData(oItems[i]["symbol"]).then(function (oStockData) {

                    var dCurrDate = Object.keys(oStockData["Time Series (Daily)"])[0];
                    var dPrevDate = Object.keys(oStockData["Time Series (Daily)"])[1];
                    if (!!dCurrDate) {
                        var sSymbol = oStockData["Meta Data"]["2. Symbol"];
                        iPrice = Number(Number(oStockData[sTimeSeries][dCurrDate]["4. close"]).toFixed(2)).toLocaleString();
                        iPrice = parseFloat(parseFloat(iPrice).toFixed(2));

                        iChange = oStockData[sTimeSeries][dCurrDate]["4. close"] - oStockData["Time Series (Daily)"][dPrevDate]["4. close"];
                        iChange = parseFloat(parseFloat(iChange).toFixed(2));

                        iChangePerc = parseFloat((iChange / oStockData[sTimeSeries][dPrevDate]["4. close"]) * 100).toFixed(2);
                        iChangePerc = parseFloat(iChangePerc);
                        iVolume = parseFloat(oStockData[sTimeSeries][dCurrDate]["5. volume"]);

                        this.self.updateToStorage(sSymbol, "stockprice", iPrice);
                        this.self.updateToStorage(sSymbol, "change", iChange);
                        this.self.updateToStorage(sSymbol, "changeperc", iChangePerc);
                        this.self.updateToStorage(sSymbol, "volume", iVolume);
                        console.log(iPrice + " " + iChange + " " + iChangePerc + " " + iVolume);
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }
        
    }
    function symbolLinkClick(value) {
        $('#input-0')[0].value = value;
        self.searchText = value;
        getQuote();
    }
    function getLocaleString(value) {
        return Number(value).toLocaleString();
    }
    function getInt(value) {
        return parseFloat(value);
    }
    function favDelete(symbol) {
        this.removeFromStorage(symbol);
    }

    function favButtonClick() {
        if (self.showPrgStockDetails) {
            if (favClicked) {
                document.getElementById('abc').setAttribute('style', 'color:rgb(245, 194, 40)');
                self.addToStorage(self.Symbol, this.favItems);
                favClicked = false;
            } else {
                document.getElementById('abc').setAttribute('style', 'color:white');
                self.removeFromStorage(self.Symbol);
                favClicked = true;
            }
        }
        
    }
    function setFavorites() {
        if (!!readFromStorage(self.Symbol)) {
            document.getElementById('abc').setAttribute('style', 'color:rgb(245, 194, 40)');
            favClicked = false;
        } else {
            document.getElementById('abc').setAttribute('style', 'color:white');
            favClicked = true;
        }
    }

    function addToStorage(symbol, value) {
        localStorage.setItem(symbol, JSON.stringify(value));
        this.afavItemsinStorage = readAllFromStorage();
    }
    function removeFromStorage(symbol) {
        delete localStorage[symbol];
        this.afavItemsinStorage = readAllFromStorage();
    }
    function updateToStorage(symbol,key,value) {
        var temp = readFromStorage(symbol);
        temp[key] = value;
        addToStorage(symbol, temp);
        this.afavItemsinStorage = readAllFromStorage();
    }
    function readFromStorage(symbol) {
        return JSON.parse(localStorage.getItem(symbol));
    }
    function readAllFromStorage() {
        var aLocalStorage = [];
        for (var i = 0; i < Object.keys(localStorage).length; i++) {
            aLocalStorage.push(JSON.parse(localStorage[Object.keys(localStorage)[i]]));
        }
        return aLocalStorage;
    }


    function fbShare() {
        if (!!aChart && self.showPrgIndicator) {
            
                var obj = {},
                    exportUrl = "http://export.highcharts.com/";
                obj.options = JSON.stringify(aChart.userOptions);
                obj.type = 'image/png';
                obj.async = true;

                $.ajax({
                    type: 'post',
                    url: 'http://export.highcharts.com/',
                    data: obj,
                    success: function (data) {
                        var ex = exportUrl + data;
                        FB.ui({
                            app_id: "745507105640564",
                            method: 'feed',
                            picture: exportUrl + data
                        }, function(response) {
                            if (response && !response.error_message) {
                                alert('Posted Successfully');
                            } else {
                                alert('Not posted');
                            }
                        });
                    }
                });


            
        }
    }
    function getRemoteData(query) {
        var deferred = $q.defer()
        $.ajax('http://sharemarkethw-env.us-east-1.elasticbeanstalk.com/timeseries?symbol=' + query, {
            crossDomain: true,
            error: function () { deferred.reject('Server error!. Cant fetch stock data'); },
            success: function (data) { deferred.resolve(data); }
        });
        return deferred.promise;
    }
    function getIndicatorData(symbol, indicator, numofplots) {

        var deferred = $q.defer();
        $.ajax('http://sharemarkethw-env.us-east-1.elasticbeanstalk.com/indicator?symbol=' + symbol + '&indicator=' + indicator, {
            crossDomain: true,
            error: function () { deferred.reject('Server error. Cant fetch Indicator data!'); },
            success: function (data) { self.aIndicatorData[indicator] = data; deferred.resolve(data); }
        });
        return deferred.promise;
    }
    function getNews() {
        if (!!self.searchText) {
            var deferred = $q.defer();
            $.ajax('http://sharemarkethw-env.us-east-1.elasticbeanstalk.com/news?symbol=' + self.searchText, {
                crossDomain: true,
                error: function () { deferred.reject('Server error. Cant fetch News data!'); },
                success: function (data) { deferred.resolve(data); }
            });
            return deferred.promise;
        }
    }
    function setNews() {
        getNews().then(function (oNewsData) {
            var sLink = "", sDate = "", sAuthor = "",sTitle="";
            if (!!oNewsData.rss) {
                if (!!oNewsData.rss.channel) {
                    if (!!oNewsData.rss.channel[0].item) {
                        if (oNewsData.rss.channel[0].item.length > 0) {
                            for (var i = 0; i < 5; i++) {
                                if (!!oNewsData.rss.channel[0].item[i]){
                                   // if (oNewsData.rss.channel[0].item[i].link[0].indexOf("https://seekingalpha.com/article") != -1) {
                                    if (!!oNewsData.rss.channel[0].item[i].link[0]) {
                                        sLink = oNewsData.rss.channel[0].item[i].link[0];
                                        var aDateParts = oNewsData.rss.channel[0].item[i].pubDate[0].split(' ');
                                        if (aDateParts[5] == "-0400") {
                                            sDate = moment(aDateParts[4], 'h:mm:ss').subtract('4', 'hours').format('h:mm:ss') + " EDT";
                                        } else if (aDateParts[5] == "-0500") {
                                            sDate = moment(aDateParts[4], 'h:mm:ss').subtract('5', 'hours').format('h:mm:ss') + " EST";
                                        } else {
                                            sDate = moment(aDateParts[4], 'h:mm:ss');
                                        }
                                        sDate = aDateParts[0] + " " + aDateParts[1] + " " +aDateParts[2] + " " + aDateParts[3] + " " + sDate;
                                        sAuthor = !!oNewsData.rss.channel[0].item[i]["sa:author_name"][0] ? oNewsData.rss.channel[0].item[i]["sa:author_name"][0] : "";
                                        sTitle = !!oNewsData.rss.channel[0].item[i]["title"][0] ? oNewsData.rss.channel[0].item[i]["title"][0]:"News";
                                        self.aNewsArr.push([sLink, sAuthor, sDate, sTitle]);
                                    }
                                } else {
                                    break;
                                }
                            }
                            self.showPrgNews = true;
                        }
                    }
                }
            }
        });
     }

    function setStockTable(oStockData) {

        var sMeta = "Meta Data";
        var sTimeSeries = "Time Series (Daily)";
        var dCurrDate = Object.keys(oStockData["Time Series (Daily)"])[0];
        var dPrevDate = Object.keys(oStockData["Time Series (Daily)"])[1];

        self.Symbol = oStockData[sMeta]["2. Symbol"];
        self.favItems.symbol = self.Symbol;
        self.LastPrice = Number(Number(oStockData[sTimeSeries][dCurrDate]["4. close"]).toFixed(2)).toLocaleString();
        self.favItems.stockprice = parseFloat(self.LastPrice); 
        var iChange = oStockData[sTimeSeries][dCurrDate]["4. close"] - oStockData["Time Series (Daily)"][dPrevDate]["4. close"];
        iChange = parseFloat(iChange).toFixed(2);
        self.favItems.change = parseFloat(iChange); 
        var iChangePercent = parseFloat((iChange / oStockData[sTimeSeries][dPrevDate]["4. close"]) * 100).toFixed(2);
        self.favItems.changeperc = parseFloat(iChangePercent);

        self.Arrow = iChange + ' (' + iChangePercent + '%)' + addArrow(iChange);
        iChange<0?document.getElementById('id_changeperc').setAttribute('style', 'color:red'): document.getElementById('id_changeperc').setAttribute('style', 'color:green');
        self.favItems.changehtml = self.Arrow;
        //self.sChange = iChange + ' (' + iChangePercent + '%)';


        self.sOpen = Number(Number(oStockData[sTimeSeries][dCurrDate]["1. open"]).toFixed(2)).toLocaleString();
        var iPrevClose = Number(oStockData[sTimeSeries][dPrevDate]["4. close"]).toFixed(2);
        var iCurrClose = Number(oStockData[sTimeSeries][dCurrDate]["4. close"]).toFixed(2);
        var oTimenClose = getTimeStampnClose(dCurrDate, dPrevDate, iPrevClose, iCurrClose);
        self.sTimeStamp = oTimenClose.time;
        self.sClose = Number(oTimenClose.close).toLocaleString();
        self.sDaysRange = Number(oStockData[sTimeSeries][dCurrDate]["3. low"]).toFixed(2) + ' - ' + Number(oStockData[sTimeSeries][dCurrDate]["2. high"]).toFixed(2);
        var sVolume = oStockData[sTimeSeries][dCurrDate]["5. volume"];
        self.favItems.volume = parseFloat(sVolume);
        self.sVolume = Number(sVolume).toLocaleString();
        self.showPrgStockDetails = true;
    }
    function addArrow(iChange) {
        if (iChange > 0) {
            return "&nbsp;<img class='arrowsize' src='http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png'>"
        } else if (iChange < 0) {
            return "&nbsp;<img class='arrowsize' src='http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png'>"
        } else {
            return "";
        }

    }
    function getTimeStampnClose(dCurrDate, dPrevDate, iPrevClose, iCurrClose) {
        // moment.tz.add('America/New_York');
        // moment.tz.add('America/Los_Angeles');
        moment.tz.add("America/Los_Angeles|PST PDT PWT PPT|80 70 70 70|010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261q0 1nX0 11B0 1nX0 SgN0 8x10 iy0 5Wp1 1VaX 3dA0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1a00 1fA0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e6")
        moment.tz.add("America/New_York|EST EDT EWT EPT|50 40 40 40|01010101010101010101010101010101010101010101010102301010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-261t0 1nX0 11B0 1nX0 11B0 1qL0 1a10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 RB0 8x40 iv0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1cN0 1cL0 1cN0 1cL0 s10 1Vz0 LB0 1BX0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6");
        //var sCurrDate = moment().tz("America/New_York").format("YYYY-MM-DD h:mm:ss z")
        var dTimeStamp = "", sClose = "";
        var day = new Date(moment().tz("America/New_York").format("YYYY-MM-DD")).getDay()
        var isWeekend = (day == 6) || (day == 0)
        if (isWeekend) {
            dTimeStamp = dCurrDate + " 16:00:00 " + moment().tz("America/New_York").format("z");
            sClose = iCurrClose;
        } else {
            var format = 'hh:mm:ss a';
            var dCurrTime = moment(moment().tz("America/New_York").format("h:mm:ss a"), format),
                beforeTime = moment('09:30:00 am', format),
                afterTime = moment('16:00:00 pm', format);
            //check if trading hours 9:30am to 4:00pm
            var bIsTradingHours = dCurrTime.isBetween(beforeTime, afterTime);
            dTimeStamp = bIsTradingHours ? dCurrDate + ' ' + moment().tz("America/New_York").format("h:mm:ss") + ' ' + moment().tz("America/New_York").format("z") : dCurrDate + " 16:00:00 " + moment().tz("America/New_York").format("z");
            sClose = bIsTradingHours ? iPrevClose : iCurrClose;
        }
        return { time: dTimeStamp, close: sClose };
    }
    function loadIndicatorChart(indicator, numofplots) {
        var sIndicator = indicator;
        var iNumofplots = numofplots;
        if (!self.aIndicatorData[indicator]) {
            if (!!self.searchText) {
                self.showPrgIndicator = false;
                getIndicatorData(self.searchText, indicator, numofplots).then(function (indData) {
                    drawIndicatorChart(indData, sIndicator, iNumofplots);
                });
            }
        } else {
            drawIndicatorChart(self.aIndicatorData[indicator], sIndicator, iNumofplots)
        }
    }
    function getQuote(state) {
        if (self.searchText) {
            self.showPrgStockDetails = false;
            self.showPrgIndicator = false;
            self.showPrgHighStock = false;
            self.showPrgNews = false;

            self.showErrorStockDetails = false;
            self.showErrorIndicator = false;
            self.showErrorHighStock = false;
            self.showErrorNews = false;
            self.aIndicatorData = {};
            self.aNewsArr = [];
            aTimeSeries = [];
            $("ul#id_ulindicators li.active").removeClass('active');          
            $('#id_price').addClass('active');
            self.showFull = false;
            self.getRemoteData(self.searchText.toUpperCase()).then(function (data) {
                if (!data["Error Message"]) {
                    self.sTimeSeriesData = data;
                    setPriceVolumeGraph();
                    setStockTable(data);
                    setFavorites();
                    setHighStocks();
                    setNews();
                } else {
                    throw data["Error Message"];
                }
            }).catch(function (err) {
                self.showErrorStockDetails = true;
                self.showErrorIndicator = true;
                self.showErrorHighStock = true;
                self.showErrorNews = true;
            });
        }
    }

    function querySearch(query) {
        var deferred = $q.defer()
        $.ajax('http://sharemarkethw-env.us-east-1.elasticbeanstalk.com/autocomplete?input=' + query, {
            crossDomain: true,
            error: function () { deferred.reject(); },
            success: function (data) { deferred.resolve(data); }
        });
        return deferred.promise;
    }

    function searchTextChange(text) {
        //$log.info('Text changed to ' + text);
        if (text.trim() == ''&&!self.clearButtonpressed) {
                $('#id_symbol').css('border-color', 'red !important');
                $("#id_validationlabel")[0].innerHTML = "Please enter a stock ticker symbol.";
                self.showGetQuote = false;

            }
        else {      
            $('#id_symbol').css('border-color', '');
            $("#id_validationlabel")[0].innerHTML = "";
            if (self.clearButtonpressed) {
                self.showGetQuote = false;
            } else {
                self.showGetQuote = true;
            }           
            self.clearButtonpressed = false;
            }   
    }

    function selectedItemChange(item) {
        // $log.info('Item changed to ' + JSON.stringify(item));
        if (!!item) {
            var self = this;

        }

    }

    function setHighStocks() {
        
        var dCurrDate = "";
        var aTemp = [];
        var oStockData = self.sTimeSeriesData;
        if (!!oStockData) {
            if (aTimeSeries.length == 0) {
                self.showPrgHighStock = false;
                for (var i = 0; i < 1000; i++) {
                    aTemp = [];
                    dCurrDate = Object.keys(oStockData["Time Series (Daily)"])[i];
                    if (!dCurrDate) { break; }
                    aTemp.push(new Date(dCurrDate).getTime());
                    aTemp.push(parseFloat(oStockData["Time Series (Daily)"][dCurrDate]["4. close"]));
                    aTimeSeries.push(aTemp);
                }
            }
            self.showPrgHighStock = true;
            Highcharts.stockChart('highstock', {
                rangeSelector: {

                    buttons: [{
                        type: 'week',
                        count: 1,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    selected: 0
                },

                title: {
                    text: self.searchText + ' Stock Price'
                },
                subtitle: {
                    text: '<a href="https://www.alphavantage.co/" target="_blank" class=>Source : Alpha Vantage</a>',
                    useHTML: true
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Stock Value'
                    }
                },
                series: [{
                    type: 'area',
                    name: 'AAPL',
                    data: aTimeSeries.slice().reverse(),
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            });
        }
    }

    function setPriceVolumeGraph() {
        if (!!self.sTimeSeriesData) {
            var oStockData = self.sTimeSeriesData;
            var dCurrDate = "";
            var sTimeSeries = "Time Series (Daily)";
            aShareVal = [], aVolumeVal = [], aDates = [];
            for (var i = 0; i < 135; i++) {
                dCurrDate = Object.keys(oStockData["Time Series (Daily)"])[i];
                if (!!dCurrDate) {
                    aDates.push(dCurrDate.split("-")[1] + "/" + dCurrDate.split("-")[2]);
                    aShareVal.push(parseFloat(oStockData[sTimeSeries][dCurrDate]["4. close"]));
                    aVolumeVal.push(parseFloat(oStockData[sTimeSeries][dCurrDate]["5. volume"]));
                } else {
                    break;
                }
                
            }
            aVolumeMax = Math.floor(parseInt(Math.max.apply(null, aVolumeVal)) / Math.pow(10, Math.floor((Math.log10(parseInt(Math.max.apply(null, aVolumeVal))))))) * Math.pow(10, Math.floor((Math.log10(parseInt(Math.max.apply(null, aVolumeVal))))));
            sSymbol = oStockData["Meta Data"]["2. Symbol"];
            drawAreaChart();
        }
    }

    function drawAreaChart() {
        var d = new Date();
        var today = [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
        aChart = Highcharts.chart('id_highchartgraph', {
            chart: {
                zoomType: 'x',
                panning: true,
                panKey: 'shift'
            },
            title: {
                text: self.searchText + ' Stock Price and Volume'
            },
            subtitle: {
                text: '<a href="https://www.alphavantage.co/" target="_blank" class=>Source : Alpha Vantage</a>',
                useHTML: true
            },
            xAxis: {
                type:'datetime',
                categories: aDates.slice().reverse(),
                tickInterval: 5,
                tickPixelInterval: 20
            }, yAxis: [{
                //min: parseInt(Math.min.apply(null, aShareVal) - 10) > 0 ? parseInt(Math.min.apply(null, aShareVal) - 10) : 0,
                min: 0,
                startOnTick: true,
                endOnTick: true,
                title: {
                    text: 'Stock Price'
                },
                labels: {
                    format: '{value}'
                }
            }, {
                lineWidth: 1,
                tickInterval: aVolumeMax / 2,
                endOnTick: false,
                opposite: true,
                title: {
                    text: 'Volume'
                }
            }], legend: {
                enabled: true,
            },
            tooltip: {
                xDateFormat: '%m/%d'
            },
            plotOptions: {
                column: {
                    pointPadding: 0,
                    borderWidth: 0,
                    groupPadding: 0,
                    shadow: false,
                    pointWidth: 0.8,

                }
            },
            series: [{
                type: 'area',
                data: aShareVal.slice().reverse(),
                lineColor: Highcharts.getOptions().colors[11],
                color: '#0000FF',
                fillOpacity: 0.1,
                lineWidth: 0.5,
                name: "Price"

            }, {
                type: 'column',
                name: "Volume",
                yAxis: 1,
                // borderColor: '#303030',
                color: Highcharts.getOptions().colors[8],
                data: aVolumeVal.slice().reverse()

            }]
        });
        self.showPrgIndicator = true;
    }
    // Indicator charts
    function getIndicatorChartData(sJsonResponse, sIndicatorName, iNumberofPlots) {
        //get sixmonths values
        var aIndicatorValues = [];
        for (var j = 0; j < iNumberofPlots; j++) {
            aIndicatorValues.push([]);
        }
        if (!!sJsonResponse) {
            if (!!sJsonResponse[Object.keys(sJsonResponse)[1]]) {
                var aDateKeys = Object.keys(sJsonResponse[Object.keys(sJsonResponse)[1]]);
                var i = 0, sDateValue, iNumberofProperties, dDate, aProperties, sIndicatorTitle;
                sIndicatorTitle = sJsonResponse[Object.keys(sJsonResponse)[0]]["2: Indicator"];
                aProperties = Object.keys(sJsonResponse[Object.keys(sJsonResponse)[1]][aDateKeys[1]]);
                while (i < 135) {
                    //dDate = new Date(aDateKeys[i]);
                    sDateValue = sJsonResponse[Object.keys(sJsonResponse)[1]][aDateKeys[i++]];
                    if (!!sDateValue) {
                        for (var j = 0; j < iNumberofPlots; j++) {
                            aIndicatorValues[j].push((parseFloat(sDateValue[aProperties[j]])).toFixed(2) / 1);
                        }
                    } else {
                        break;
                    }

                }
            }
        }
        return { indicatorData: aIndicatorValues, labels: aProperties, indicatorTitle: sIndicatorTitle };
    }
    function drawIndicatorChart(sJsonResponse, sIndicatorName, iNumberofPlots) {
        var aPlotSeries = [];
        var oPlotSeries = {};
        var aChartData = getIndicatorChartData(sJsonResponse, sIndicatorName, iNumberofPlots);
        for (var i = 0; i < iNumberofPlots; i++) {
            oPlotSeries = {};
            oPlotSeries.type = 'line',
                oPlotSeries.data = aChartData.indicatorData[i].slice().reverse(),
                oPlotSeries.marker = {},
                oPlotSeries.marker.enabled = false,
                oPlotSeries.marker.radius = 2,
                oPlotSeries.lineColor = Highcharts.getOptions().colors[i],
                oPlotSeries.color = Highcharts.getOptions().colors[i],
                oPlotSeries.fillOpacity = 0.5,
                oPlotSeries.lineWidth = 0.8,
                oPlotSeries.name = aChartData.labels[i],
                aPlotSeries.push(oPlotSeries);
        }
        var iYmin = "";
        if (sIndicatorName == "STOCH") {
            iYmin = parseInt(Math.min.apply(null, aChartData.indicatorData[1]) - 5);
        } else if (sIndicatorName == "BBANDS") {
            iYmin = parseInt(Math.min.apply(null, aChartData.indicatorData[1]) - 5);
        } else {
            iYmin = parseInt(Math.min.apply(null, aChartData.indicatorData[0]) - 5);
        }
        aChart = Highcharts.chart('id_highchartgraph', {
            chart: {
                zoomType: 'x',
                panning: true,
                panKey: 'shift'
            },
            title: {
                text: aChartData.indicatorTitle
            },
            subtitle: {
                text: '<a href="https://www.alphavantage.co/" target="_blank">Source : Alpha Vantage</a>',
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                categories: aDates.slice().reverse(),
                tickInterval: 5,
                tickPixelInterval: 20
            }, yAxis: [{
                min: iYmin,
                startOnTick: false,

                endOnTick: true,
                title: {
                    text: sIndicatorName
                },
                labels: {
                    format: '{value}'
                }
            }], legend: {
                enabled: true,            
            },
            tooltip: {
                xDateFormat: '%m/%d'
            },
            series: aPlotSeries
        });
        self.showPrgIndicator = true;
    }
}
