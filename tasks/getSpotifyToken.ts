import { Task } from 'klasa';
import fetch from 'node-fetch';

/*
 * Login to https://developer.spotify.com/dashboard/applications
 * Create an app & get your clientID/secret, place them below
 * Run every 1 hour to refresh: this.client.schedule.create("getSpotifyToken", "0 * * * *");
 */
const clientID = '';
const clientSecret = '';

const authorization = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
const options = {
	method: 'POST',
	body: 'grant_type=client_credentials',
	headers: {
		Authorization: `Basic ${authorization}`,
		'Content-Type': 'application/x-www-form-urlencoded',
	},
};

export default class extends Task {
	private _spotifyToken = '';
	/* eslint-disable @typescript-eslint/no-floating-promises */
	async run(): Promise<void> {
		this._getToken();
	}
	async init(): Promise<void> {
		this._getToken();
	}
	/* eslint-enable @typescript-eslint/no-floating-promises */
	private async _getToken() {
		try {
			this._spotifyToken = await fetch('https://accounts.spotify.com/api/token', options)
				.then((res): Promise<any> => res.json())
				.then((body): Promise<string> => body.access_token);
		} catch (err) {
			this.client.emit('wtf', err);
		}
	}
}
