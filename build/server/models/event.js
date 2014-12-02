// Generated by CoffeeScript 1.8.0
var Event, RRule, americano, iCalDurationToUnitValue, moment;

americano = require('americano-cozy');

moment = require('moment-timezone');

RRule = require('rrule').RRule;

module.exports = Event = americano.getModel('Event', {
  start: {
    type: String
  },
  end: {
    type: String
  },
  place: {
    type: String
  },
  details: {
    type: String
  },
  description: {
    type: String
  },
  rrule: {
    type: String
  },
  tags: {
    type: function(x) {
      return x;
    }
  },
  attendees: {
    type: [Object]
  },
  related: {
    type: String,
    "default": null
  },
  timezone: {
    type: String
  },
  alarms: {
    type: [Object]
  }
});

Event.dateFormat = 'YYYY-MM-DD';

Event.ambiguousDTFormat = 'YYYY-MM-DDTHH:mm:00.000';

Event.utcDTFormat = 'YYYY-MM-DDTHH:mm:00.000Z';

Event.alarmTriggRegex = /(\+?|-)PT?(\d+)(W|D|H|M|S)/;

Event.all = function(params, callback) {
  return Event.request("all", params, callback);
};

Event.prototype.isAllDay = function() {
  return this.start.length === 10;
};

iCalDurationToUnitValue = function(s) {
  var m, o;
  m = s.match(/(\d+)(W|D|H|M|S)/);
  o = {};
  o[m[2].toLowerCase()] = parseInt(m[1]);
  return o;
};

Event.prototype.getAlarms = function(defaultTimezone) {
  var ALLDAY_FORMAT, alarm, alarms, cozyAlarm, date, in24h, key, now, occurrence, occurrences, rrule, startDate, startDates, timezone, trigg, unitValues, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
  alarms = [];
  ALLDAY_FORMAT = 'YYYY-MM-DD';
  timezone = this.timezone || defaultTimezone;
  _ref1 = (_ref = this.alarms) != null ? _ref.items : void 0;
  for (key = _i = 0, _len = _ref1.length; _i < _len; key = ++_i) {
    alarm = _ref1[key];
    startDates = [];
    if ((this.rrule != null) && this.rrule.length > 0) {
      now = moment().tz(timezone);
      in24h = moment(now).add(1, 'days');
      rrule = RRule.parseString(this.rrule);
      occurrences = new RRule(rrule).between(now.toDate(), in24h.toDate());
      for (_j = 0, _len1 = occurrences.length; _j < _len1; _j++) {
        occurrence = occurrences[_j];
        if (this.isAllDay()) {
          date = moment.tz(occurrence, ALLDAY_FORMAT, timezone);
        } else {
          date = moment.tz(occurrence, timezone);
        }
        startDates.push(date);
      }
    } else if (this.isAllDay()) {
      startDates = [moment.tz(this.start, ALLDAY_FORMAT, timezone)];
    } else {
      startDates = [moment.tz(this.start, 'UTC')];
    }
    for (_k = 0, _len2 = startDates.length; _k < _len2; _k++) {
      startDate = startDates[_k];
      trigg = moment.tz(startDate, timezone);
      unitValues = iCalDurationToUnitValue(alarm.trigg);
      for (key in unitValues) {
        value = unitValues[key];
        trigg.subtract(value, key);
      }
      cozyAlarm = {
        _id: "" + this._id + "_" + alarm.id,
        action: alarm.action,
        trigg: trigg.format(),
        description: this.description,
        timezone: timezone
      };
      alarms.push(cozyAlarm);
    }
  }
  return alarms;
};