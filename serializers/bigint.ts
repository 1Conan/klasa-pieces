// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.

import { Language, SchemaPiece, Serializer } from 'klasa';

export default class extends Serializer {
	async deserialize(data: any, piece: SchemaPiece, language: Language) {
		if (data instanceof BigInt) return data;
		try {
			return BigInt(data);
		} catch {
			throw language.get('RESOLVER_INVALID_INT', piece.key);
		}
	}

	serialize(data: any) {
		return data.toString();
	}
}
