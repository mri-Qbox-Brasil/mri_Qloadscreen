fx_version 'cerulean'
lua54 'yes'
game 'gta5'

author 'MRI BRASIL'
description 'mri_Qloadscreen'
version '2.2.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

shared_script '@ox_lib/init.lua'
server_script 'server.lua'
client_script 'client.lua'

files {
    'html/index.html',
    'html/admin.html',
    'html/assets/*',
    'config/logo/*',
    'config/staffs/*',
    'config/video/*',
    'config/audio/*',
}

dependency 'ox_lib'
