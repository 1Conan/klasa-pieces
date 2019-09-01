// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import * as firebase from 'firebase-admin';
import { Provider, ScheduledTask } from 'klasa';

/**
 * 1. Go to https://firebase.google.com/
 * 2. Login/Signup
 * 3. Go to Console
 * 4. Create new project
 * 5. Go to the database section
 * 6. Select Firestore. NOTE- Don't select Real time database
 * 7. Then in the LHS of the page, finda settings icon next to Project Overview, select Project settings.
 * 8. Go to service accounts
 * 9. Click Generate new private key, which will download a json file.
 * 10. Copy the databaseURL from the same page.
 * 11. Import the json, where ever you are initializing the client.
 * 12. Pass this to the client constructor:
 * providers: {
 *   default: 'firestore',
 *   firestore: {
 *     credentials: variable_name_for_json // serviceAccount when using example above
 *     databaseURL: 'databaseURL from the service account page'
 *   }
 * }
 * 13. Download the `firebase-admin` and `@google-cloud/firestore` packages
 */

/**
 * @Alterantive
 * Using environment variables instead of loading a JSON for step 12
 * 1. Follow steps 1 through 11 of the section above
 * 2. Install the `dotenv` packages
 * 3. Open the JSON you downloaded from firebase
 * 4. Create a file named `.env` in the root of your project
 * 5. Insert three values in this file:
 * ```sh
 *  FIREBASE_PROJECT= "the name of the project, it's also part of the database URL (after https:// and before firebase.io)"
 *  FIREBASE_EMAIL=the ''"client_email" from the JSON'
 *  FIREBASE_KEY=the '"private_key" from the JSON'
 * ```
 * 6. Where you initiate your bot (for example `src/index.js` or `src/app.js`) set up dotenv:
 *    require('dotenv').config()
 * 7. Pass this to the client constructor:
 * // other options
 * providers: {
 *   default: 'firestore',
 *   firestore: {
 *     credentials: {
 *       project: process.env.FIREBASE_PROJECT,
 *       clientEmail: process.env.FIREBASE_EMAIL,
 *       privateKey: process.env.FIREBASE_KEY
 *     },
 *     databaseURL: `https://${process.env.FIREBASE_PROJECT}.firebaseio.com`,
 *   }
 * }
 * 8. Follow step 13 of the section above
 */
export default class extends Provider {
	public db: FirebaseFirestore.Firestore | null = null;

	async init() {
		await firebase.initializeApp({
			credential: firebase.credential.cert(this.client.options.providers.firestore.credentials),
			databaseURL: this.client.options.providers.firestore.databaseURL
		});

		this.db = firebase.firestore();
	}

	async hasTable(table: string) {
		const col = await this.db!.collection(table).get();

		return Boolean(col.size);
	}

	async createTable(table: string) {
		return this.db!.collection(table);
	}

	async getKeys(table: string) {
		const snaps = await this.db!.collection(table).get();

		return snaps.docs.map((snap) => snap.id);
	}

	async get(table: string, id: string) {
		const snap = await this.db!.collection(table).doc(id).get();

		return this.packData(snap.data(), snap.id);
	}

	async has(table: string, id: string) {
		const data = await this.db!.collection(table).doc(id).get();

		return data.exists;
	}

	create(table: string, id: string, doc: FirebaseFirestore.DocumentData = {}) {
		doc = this.parseUpdateInput(doc);

		if ((doc as { schedules: ScheduledTask[] }).schedules && doc.schedules.every((schedule: unknown) => schedule instanceof ScheduledTask)) {
			const [data] = (doc as { schedules: ScheduledTask[] }).schedules.map((schedule) => schedule.toJSON());
			doc = {
				schedules: [
					data
				],
			};
		}

		return this.db!.collection(table).doc(id).set(doc);
	}

	update(table: string, id: string, doc: FirebaseFirestore.UpdateData) {
		doc = this.parseUpdateInput(doc);

		if ((doc as { schedules: ScheduledTask[] }).schedules && doc.schedules.every((schedule: unknown) => schedule instanceof ScheduledTask)) {
			const [data] = (doc as { schedules: ScheduledTask[] }).schedules.map((schedule) => schedule.toJSON());
			doc = {
				schedules: [
					data
				],
			};
		}

		return this.db!.collection(table).doc(id).update(doc);
	}

	delete(table: string, id: string) {
		return this.db!.collection(table).doc(id).delete();
	}

	replace(table: string, id: string, doc: FirebaseFirestore.DocumentData) {
		return this.create(table, id, doc);
	}

	async getAll(table: string, filter: unknown[] = []) {
		const snapshots = await this.db!.collection(table).get();
		const data = snapshots.docs.map((snapshot) => this.packData(snapshot.data(), snapshot.id)) as FirebaseFirestore.QueryDocumentSnapshot[];

		return filter.length ? data.filter((nodes) => filter.includes(nodes.id)) : data;
	}

	async deleteTable(table: string) {
		return undefined;
	}

	packData(data: unknown, id: string) {
		return {
			...data,
			id,
		};
	}

};