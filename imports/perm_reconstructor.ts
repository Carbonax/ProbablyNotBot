import { Guild, Role } from "discord.js";

export default (guild: Guild, perms: any) => {
	const newPerms = perms.filter(
		(permission: any) => permission.type == "ROLENAME"
	);
	if (newPerms.length == 0) return perms as any[];

	for (const permission of newPerms) {
		const role = guild.roles.cache.find(
			(role: Role) => role.name === permission.id
		);
		permission.type = "ROLE";
		permission.id = role ? role.id : 0;
	}

	return newPerms as any[];
};
