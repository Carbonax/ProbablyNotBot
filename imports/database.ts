import mongoose from "mongoose";
import logger from "../modules/logger";

class _Database {
	async connect() {
		return await mongoose
			.connect(process.env.MONGO!, { keepAlive: true })
			.then(() => logger.log("Connected", "Database"));
	}

	RoleMessage: mongoose.Model<any>;
	constructor() {
		this.RoleMessage = mongoose.model(
			"messages",
			new mongoose.Schema({
				channelId: {
					type: String,
					required: true,
				},
				messageId: {
					type: String,
					required: true,
				},
				roleId: {
					type: String,
					required: true,
				},
				emojiName: {
					type: String,
					required: true,
				},
			})
		);
	}
}

export default new _Database();
