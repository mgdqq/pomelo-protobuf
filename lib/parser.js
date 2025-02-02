var Parser = module.exports;

/**
 * [parse the original protos, give the paresed result can be used by protobuf encode/decode.]
 * @param  {[Object]} protos Original protos, in a js map.
 * @return {[Object]} The presed result, a js object represent all the meta data of the given protos.
 */
Parser.parse = function(protos){
	var maps = {};
	for(var key in protos){
		maps[key] = parseObject(protos[key]);
	}

	return maps;
};

function parseMapType(str) {
	const [, keyType, vt] = /<(.*?),(.*)>/gm.exec(str).map(s => s.trim());

	let type = vt;
	if (vt.startsWith('map')) {
		type = parseMapType(vt);
	} else if (vt.startsWith('repeated')) {
		const [rOption, rType] = vt.split(' ');
		type = {
			option: rOption,
			type: rType
		}
	}

	return {
		option: 'map',
		keyType,
		type
	}
}

/**
 * [parse a single protos, return a object represent the result. The method can be invocked recursively.]
 * @param  {[Object]} obj The origin proto need to parse.
 * @return {[Object]} The parsed result, a js object.
 */
function parseObject(obj){
	var proto = {};
	var nestProtos = {};
	var tags = {};

	for(var name in obj){
		var tag = obj[name];
		var params = name.split(' ');

		switch(params[0]){
			case 'message':
				if(params.length !== 2){
					continue;
				}
				nestProtos[params[1]] = parseObject(tag);
				continue;
			case 'required':
			case 'optional':
			case 'repeated':{
				//params length should be 3 and tag can't be duplicated
				if(params.length !== 3 || !!tags[tag]){
					continue;
				}
				proto[params[2]] = {
					option : params[0],
					type : params[1],
					tag : tag
				};
				tags[tag] = params[2];
				break;
			}

			default: {
				if (params[0].startsWith('map')) {
					const fieldName = params.pop();
					proto[fieldName] = {
						...parseMapType(name),
						tag: tag
					};
					tags[tag] = fieldName;
				}
			}
		}
	}

	proto.__messages = nestProtos;
	proto.__tags = tags;
	return proto;
}