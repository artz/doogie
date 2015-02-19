var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var statusSchema = new Schema({
	name: { type: String, required: true },
	level: { type: Number, default: 0 },
	description: { type: String, required: true }
});
mongoose.model('Status', statusSchema);

var serviceSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	_lastStatus: { type: ObjectId, ref: 'Status' },
	_lastEvent: { type: ObjectId, ref: 'Event' }
});
var Service = mongoose.model('Service', serviceSchema);

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
		service._lastStatus = event._status;
		service._lastEvent = event._id;
		// TODO: Websocket hooks to alert when status changes.
		service.save();
	});
});
mongoose.model('Event', eventSchema);

