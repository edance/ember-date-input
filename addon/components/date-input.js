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
  date: Ember.computed("value", {
    get: function() {
      return this.getDate();
    },
    set: function(key, date) {
      this.setValue(date);
      return date;
    }
  }),
  setValue(date) {
    var split;

    if (Ember.isNone(date)) {
      return;
    }
    if (this.equalDate(date)) {
      return;
    }
    split = date.split("-");
    this.set("value", `${split[1]} / ${split[2]} / ${split[0]}`);
  },
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
    if (position === 0) {
      return character.match(/[0-9]/) != null;
    }
    if (position === 1) {
      ct = text[0];
      if (ct === "0") {
        return character.match(/[1-9]/) != null;
      } else {
        return (ct === "1" || ct === "2") && character.match(/[0-2]/) != null;
      }
    }

    if (position === 5) {
      return character.match(/[0-9]/) != null;
    }
    if (position === 6) {
      ct = parseInt(text[5], 10) * 10;
      return ct + parseInt(character, 10) <= this.daysInMonth(parseInt(text.substring(0, 2), 10));
    }
    if (position >= 10 && position <= 13) {
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
  getDate() {
    var value = this.get("value"),
        split, year;

    if (!this.isValid()) {
      return null;
    }
    split = value.split(" / ");
    year = split[2];

    if (split[2].length === 2) {
      year = `20${year}`;
    }
    return `${year}-${split[0]}-${split[1]}`;
  },
  equalDate(date) {
    return date === this.getDate();
  }
});
