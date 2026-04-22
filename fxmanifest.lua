fx_version 'bodacious'
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
	'html/index.html',
    'html/assets/*',
    'config/config.lua',
    'config/logo/*.png',
    'config/logo/*.jpg',
    'config/logo/*.jpeg',
    'config/staffs/*.png',
    'config/staffs/*.jpg',
    'config/staffs/*.jpeg',
    'config/video/*.mp4',
    'config/video/*.webm',
    'config/audio/*.mp3',
    'config/audio/*.ogg',
}
