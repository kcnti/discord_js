require('dotenv').config();
const { Client, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const client = new Client();
const mysql = require('mysql')

let db = mysql.createConnection({
    host:       'localhost', 
    user:       'kanti',
    password:   'Kikuanone1234!',
    database:   'Discord'
});
db.connect();

function queryInfo(name, callback) {
    db.query("SELECT * FROM account WHERE name='" + name + "'", (error, res, fields) => {
        if (error) throw error;
        return callback(res[0]);
    })
}

client.on('ready', () => {
    console.log(`logged in as ${client.user.tag}!`);
    client.user.setStatus('idle')
    client.user.setActivity('you', { type: 'WATCHING' });
});

function resp(id) {
    return fetch("http://kanti.tk:8081/account/" + id.toString(10))
    .then(response => {
        return response.json();
    }).then(data => {
        return data["data"][0];
    });
}

const prefix = "$";
client.on('message', msg => {
    if (!msg.content.startsWith(prefix)) return;

    const args = msg.content.trim().split(/ +/g);
    const cmd = args[0].slice(prefix.length).toLowerCase(); // case INsensitive, without prefix

    console.log(`[${msg.author.tag}]: ${msg.content}`)
    if(msg.content == 'pfp') {
        msg.reply(msg.author.displayAvatarURL());
    }
    if(msg.content == 'embed') {
        embed = new MessageEmbed()
                .setTitle('Embed JS!')
                .setAuthor('Kanti')
                .setColor('255')
                .setDescription('embed message!')
        msg.channel.send(embed)
    }
    if(cmd == "get_api") {
        console.log('1');
        resp(args[1]).then(data => {
            var text = data['username'] + '\n' + data['password'];
            msg.channel.send(text);
        });
	}
    if(cmd == "get_info") {
        queryInfo(args[1], data => {
            var text = "<@"+data["name"]+">\n"+"Balance: "+data["balance"]+"\n"
            msg.channel.send(text);
            console.log(cmd);
        });
    }
});

client.on('inviteCreate', invite => {
    const channel = invite.guild.channels.cache.find(ch => ch.name === 'log')
    channel.send(`${invite.inviter} create invite link ${invite.code}`)
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log-🪵');
    if(!channel) {
        return;
    }
    channel.send(`Welcome to server kub, ${member}`)
});

client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log-🪵')
    if(!channel) {
        return;
    }
    channel.send(`Bye Bye~~, ${member}`)
})

client.on('messageDelete', msg => {
    const channel = msg.guild.channels.cache.find(ch => ch.name === 'message-deleted');
    if(!channel) {
        return;
    }
    channel.send(`${msg.author.tag} has deleted '${msg.content}'`)
})

client.login(process.env.TOKEN);
