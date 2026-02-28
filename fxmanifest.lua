fx_version 'cerulean'
game 'gta5'

author 'SnowDeve'
description 'mri_Qloadscreen'
version '2.0.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'no'

shared_script 'config/config.lua'
client_script 'client.lua'

files {
	'html/**',
	'config/**',
    'config/logo/**/*.png',
    'config/video/**/*.mp4',
    'config/audio/**/*.mp3',
}
