/// <reference path="hitbtc.ts" />
/// <reference path="atlasats.ts" />
/// <reference path="okcoin.ts" />
/// <reference path="ui.ts" />
/// <reference path="arbagent.ts" />
/// <reference path="../common/models.ts" />
/// <reference path="config.ts" />

import Config = require("./config");
import HitBtc = require("./hitbtc");
import OkCoin = require("./okcoin");
import BtcChina = require("./btcchina");
import Broker = require("./broker");
import Agent = require("./arbagent");
import UI = require("./ui");
import Models = require("../common/models");
import Utils = require("./utils");
import Interfaces = require("./interfaces");
import Quoter = require("./quoter");

var env = process.env.TRIBECA_MODE;
var config = new Config.ConfigProvider(env);
var gateway = new HitBtc.HitBtc(config);
var persister = new Broker.OrderStatusPersister();
var broker = new Broker.ExchangeBroker(gateway.md, gateway.base, gateway.oe, gateway.pg, persister);
var fvAgent = new Agent.FairValueAgent(broker);
var paramsRepo = new Agent.QuotingParametersRepository();
var quoteGenerator = new Agent.QuoteGenerator(paramsRepo, fvAgent);
var quoter = new Quoter.Quoter(broker);
var trader = new Agent.Trader(broker, quoteGenerator, quoter);
var ui = new UI.UI(env, broker.pair, broker, trader, fvAgent, quoteGenerator, paramsRepo);

var exitHandler = e => {
    if (!(typeof e === 'undefined') && e.hasOwnProperty('stack'))
        Utils.log("tribeca:main")("Terminating", e, e.stack);
    else
        Utils.log("tribeca:main")("Terminating [no stack]");
    broker.cancelOpenOrders();
    process.exit();
};
process.on("uncaughtException", exitHandler);
process.on("SIGINT", exitHandler);