import Ember from 'ember';
import layout from '../templates/components/date-input';

export default Ember.TextField.extend({
  layout: layout,
  type: 'date',
  date: Ember.computed.alias('value'),
});
