const { Client, MessageEmbed } = require('discord.js');
const { createConnection } = require('mysql');
const config = require('./config.json');
const client = new Client();
let con = createConnection(config.mysql);
con.connect(err => {
    if (err) return console.log(err);
    console.log(`MySQL has been connected!`);
});
// Ready event
client.on('ready', () => {
    console.log(`${client.user.tag} is online!`);
});
// Message event
client.on('message', message => {
    if (message.author.bot || !message.guild) return;
    con.query(`SELECT * FROM settings WHERE setting = 'prefix'`, (err, row) => {
        let prefix = row[0].value;
        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let command = args.shift().toLowerCase();
        if (!message.content.startsWith(prefix)) return;
        if (message.guild && !message.member) await message.guild.fetch.members(message.author);
        let member = message.guild.member(message.mentions.users.first() || args[0]);
        // Commands (It doesn't matter where you want to use your MySQl connection)
        switch (command) {
            case 'ping':
                message.channel.send(`The client ping is **${client.ws.ping}ms**`);
                break;
            case 'avatar':
                let avatarEmbed = new MessageEmbed()
                    .setTitle(`**${member ? member.user.tag : message.author.tag}'s avatar:**`)
                    .setImage(`${member ? member.user.avatarURL() : message.author.displayAvatarURL()}`)
                    .setTimestamp()
                    .setFooter(`Example`)
                message.channel.send(avatarEmbed);
                break;
            case 'settings':
                // New prfix
                let newPrefix = args[0];
                if (!newPrefix) return message.channel.send(`Maybe you have forget to enter a new prefix!`);
                // Using the UPDATE query
                con.query(`UPDATE settings SET setting = '${newPrefix}' WHERE setting = 'prefix'`, (err, row) => {
                    // Return if there is an error
                    if (err) return console.log(err);
                    message.channel.send(`The prefix has been updated!`);
                });
        }
    });
});
client.login(config.client.token);