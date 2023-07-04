var protobuf = require('../../lib/protobuf');
var util = require('../../lib/util');
var should = require('should');

var tc = require('./example');

describe('msgEncoderTest', function () {

	var protos = protobuf.parse(require('./protos.json'));

	protobuf.init({ encoderProtos: protos, decoderProtos: protos });

	it('protobufTest', function () {
		for (var route in tc) {
			var msg = tc[route];
			var buffer = protobuf.encode(route, msg);

			var decodeMsg = protobuf.decode(route, buffer);

			util.equal(msg, decodeMsg).should.equal(true);
		}
	});
});