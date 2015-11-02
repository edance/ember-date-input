import Ember from 'ember';
import layout from '../templates/components/date-input';

export default Ember.TextField.extend({
  layout: layout,
  placeholder: "MM/DD/YY",
  maxlength: 14,
  isValid() {
    const value = this.get("value");

    if (Ember.isNone(value)) {
      return false;
    }
    return !!value.match(/^\d\d \/ \d\d \/ \d\d(\d\d)?$/);
  },
  setValue: function() {
    var date = this.get("date"),
        month, day, year;

    if (Ember.isNone(date)) {
      return;
    }
    month = date.getMonth() + 1;
    day = date.getDate();
    year = date.getFullYear();
    if (day.toString().length === 1) { day = "0" + day; }
    this.set("value", `${month} / ${day} / ${year}`);
  }.on("didInsertElement"),
  keyDown(e) {
    let $element = this.$(),
        code = e.keyCode,
        position = $element.prop("selectionStart"),
        value = this.get("value");

    // Immediately allow certain keys
    if (code <= 40) {
      return true;
    }

    // The user has entered a slash
    if (code === 111 || code === 191) {
      return this.slash(position, value);
    }

    // Check valid code at position
    return this.validChar(value, position, code);
  },
  keyUp(e) {
    let $element = this.$(),
        code = e.keyCode,
        position = $element.prop("selectionStart"),
        value = this.get("value");

    // Backspace
    if (code === 8) {
      this.backspace(position, value);
    }

    // Automatically insert " / " between fields
    if (position === 2 || position === 7) {
      this.set("value", value + " / ");
    }
  },
  slash(position, value) {
    // Determine if the current field needs to be 0 padded
    if (position === 1 && value[0] !== "0") {
      this.set("value", "0" + value);
    } else if (position === 6 && value[5] !== "0") {
      // User has entered a single character, non-zero day
      this.set("value", "" + (value.substring(0, 5)) + "0" + value[5]);
    }
    return false;
  },
  backspace(position, value) {
    // Handle backspace over slash between MM and DD
    if ((position === 3) || (position === 4)) {
      this.set("value", value.substring(0, 1));
    }

    // Handle backspace over slash between DD and YY
    if ((position === 9) || (position === 8)) {
      this.set("value", value.substring(0, 6));
    }
  },
  validChar(text, position, code) {
    var character, ct;
    code = (96 <= code && code <= 105 ? code - 48 : code);
    character = String.fromCharCode(code);
    switch (position) {
      case 0:
        return character.match(/[0-9]/) != null;
      case 1:
        if (text[0] === "0") {
          return character.match(/[1-9]/) != null;
        } else {
          return character.match(/[0-2]/) != null;
        }
      case 5:
        return character.match(/[0-9]/) != null;
      case 6:
        if (text[5] === "0") {
          return character.match(/[1-9]/) != null;
        }

        // Assert that the second character in DD does not exceed days in current month
        ct = parseInt(text[5], 10) * 10;
        return ct + parseInt(character, 10) <= this.daysInMonth(parseInt(text.substring(0, 2), 10));
      case 10:
        return true;
      case 11:
        return true;
      case 12:
        return true;
      case 13:
        return true;
    }
    return false;
  },
  daysInMonth(month) {
    if (month === 2) {
      return 29;
    }
    if (month === 4 || month === 6 || month === 9 || month === 11) {
      return 30;
    }
    return 31;
  },
  setDate: function() {
    var value = this.get("value"),
        date, split, month, day, year;

    if (!this.isValid()) {
      return this.set("date", null);
    }
    if (Ember.isNone(this.get("date"))) {
      split = value.split(" / ");
      month = parseInt(split[0]) - 1;
      day = parseInt(split[1]);
      year = parseInt(split[2]);

      if (split[2].length == 2) {
        year += 2000;
      }
      this.set("date", new Date(year, month, day));
    }
  }.observes("value")
});
