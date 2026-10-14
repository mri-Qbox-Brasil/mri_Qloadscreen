fx_version 'cerulean'
lua54 'yes'
game 'gta5'

author 'MRI BRASIL'
description 'mri_Qloadscreen'
version '2.2.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'
ui_page 'html/preview.html'

shared_script '@ox_lib/init.lua'
server_scripts {
    'files.js',
    'server.lua',
}
client_script 'client.lua'

files {
    'html/index.html',
    'html/admin.html',
    'html/preview.html',
    'html/assets/*',
    'config/logo/*',
    'config/staffs/*',
    'config/video/*',
    'config/audio/*',
}

dependency 'ox_lib'
