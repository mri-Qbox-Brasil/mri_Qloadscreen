fx_version 'cerulean'
game 'gta5'

author 'SnowDeve'
description 'mri_Qloadscreen'
version '2.0.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

shared_script 'config/config.lua'
server_script 'server.lua'
client_script 'client.lua'

files {
	'html/**',
	'config/**',
    'config/logo/**/*.{png,jpg,jpeg}',
    'config/staffs/**/*.{png,jpg,jpeg}',
    'config/video/**/*.{mp4,webm}',
    'config/audio/**/*.{mp3,ogg}',
}
