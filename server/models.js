var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var slack = require('./slack');

var userSchema = new Schema({
	account: { type: String, required: true, index: true },
	username: { type: String, required: true },
	displayName: String,
	roles: []
});
mongoose.model('User', userSchema);

var statusSchema = new Schema({
	name: { type: String, required: true },
	level: { type: Number, default: 0 },
	description: { type: String, required: true }
});
var Status = mongoose.model('Status', statusSchema);

var serviceSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	_lastStatus: { type: ObjectId, ref: 'Status' },
	_lastEvent: { type: ObjectId, ref: 'Event' }
});
var Service = mongoose.model('Service', serviceSchema);

var checkSchema = new Schema({
	name: { type: String, required: true },
	url: { type: String, required: true },
	method: { type: String, required: true, default: 'GET' },
	headers: {},
	params: {},
	body: String,
	successCode: { type: String, default: '^2[0-9][0-9]$' },
	errorCode: String,
	successResponseTime: { type: Number, default: 1000 },
	errorResponseTime: { type: Number, default: 6000 },
	_service: { type: ObjectId, ref: 'Service', required: true }
});
mongoose.model('Check', checkSchema);

var eventSchema = new Schema({
	_service: { type: ObjectId, ref: 'Service', required: true },
	_status: { type: ObjectId, ref: 'Status', required: true },
	message: { type: String, required: true },
	createdAt: Date,
	updatedAt: Date
});
eventSchema.pre('save', function timestamp(next) {
	var now = new Date();
	this.updatedAt = now;
	if (!this.createdAt) {
		this.createdAt = now;
	}
	next();
});
// Hook to update service's current event.
eventSchema.post('save', function timestamp(next) {
	var event = this;
	Service.findById(event._service, function (err, service) {
		if (err) {
			return next(err);
		}
		// TODO: Update this on deletes.
		service._lastStatus = event._status;
		service._lastEvent = event._id;
		// TODO: Websocket hooks to alert when status changes.
		service.save();

		// If new, notify Slack channel of current status.
		// TODO: Make this a flag on the event.
		// TODO: Test this, seems to not be working.
		if (this.createdAt === this.updatedAt) {
			Status.findById(event._status, function (err, status) {
				event.service = service;
				event.status = status;
				slack.event(event);
			});
		}

	});

});
mongoose.model('Event', eventSchema);
