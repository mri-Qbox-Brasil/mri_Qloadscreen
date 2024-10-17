const config = {
  autoSlideInterval: 3000, // Tempo de transição automática de slides (ms)
  autoPlay: true, // Valor booleano para controlar a reprodução automática
  musicVolume: 0.05, // Nível de volume padrão (0 = 0%; 0,5 = 50%; 1 = 100%)
  background: {
    type: "video", // "imagem" ou "vídeo"
    url: "QdBZY2fkU-0", // ID do vídeo do YouTube ou caminho do arquivo de imagem
    videoProvider: "youtube", // Apenas para vídeos do YouTube
  },
  socialMedia: [
    // Máximo de 4 itens
    // {
    //   name: "Web",
    //   icon: "/public/images/web.svg",
    //   link: "https://discord.gg/uEfGD4mmVh",
    // },
    {
      name: "Discord",
      icon: "/public/images/discord.svg",
      link: "https://discord.gg/uEfGD4mmVh",
    },
    {
      name: "YouTube",
      icon: "/public/images/youtube.svg",
      link: "https://www.youtube.com/@QBCoreBrasil",
    },
    // {
    //   name: "Instagram",
    //   icon: "/public/images/insta.svg",
    //   link: "https://discord.gg/uEfGD4mmVh",
    // },
  ],

  images: [
    "/public/images/images_1.png",
    "/public/images/images_2.png",
    "/public/images/images_3.png",
    "/public/images/images_4.png",
    // Você pode adicionar mais imagens
  ],

  songs: [
    // Você pode adicionar mais músicas
    {
      title: "Love Is a Long Road",
      artist: "Tom Petty",
      src: "/public/music/TomPetty.mp3",
      img: "/public/images/love.jpg",
    },
    // {
    //   title: "The Setup",
    //   artist: "Favored Nations",
    //   src: "/public/music/The-Setup.mp3",
    //   img: "/public/images/the-setup.jpg",
    // },
    // {
    //   title: "Welcome The Los Santos",
    //   artist: "Oh No",
    //   src: "/public/music/Welcome-To-Los-Santos.mp3",
    //   img: "/public/images/welcome-lst.jpg",
    // },
  ],

  locales: {
    headerTitle: "MRI QBOX", // Título do cabeçalho
    headerSubtitles: [
      "A maior comunidade opensource Brasileira de FiveM!",
      "Entre em nossa comunidade no discord!",
      // Você pode adicionar mais legendas
    ],
    cardTitles: [
      "Bem-vindo à base MRI QBOX!",
      "Crie e gerencie seu servidor dentro do jogo!",
      "Entre em nossa Comunidade do Discord!",
      // Você pode adicionar mais títulos
    ],
    cardDescriptions: [
      "Nosso objetivo é oferecer os melhores scripts e soluções para FIVEM de forma gratuita. Não vendemos nenhum tipo de conteúdo que está nessa base. Tudo aqui foi criado e disponibilizado por colaboradores da comunidade de FIVEM do mundo inteiro. Todos os direitos e créditos são de seus devidos autores.",
      "Descubra um novo jeito de gerenciar seu servidor! Nossa base oferece uma série de ferramentas in game para que você e sua staff possam ter mais independência na hora de criar sua cidade.",
      "Precisando de ajuda para desenvolver algum script? Suporte para instalação ou configuração de algo na sua base? Entre em nosso discord e utilize os canais de ajuda para tirar suas dúvidas com todos da comunidade ou contrate nossa equipe de desenvolvedores! ", 
      // Você pode adicionar mais descrições
    ],
    serverGalleryTitle: "Memórias", // Título para a seção da galeria do servidor
    serverGalleryDescription: "São valiosas...", // Descrição da seção da galeria do servidor
    socialMediaText: "Conheça nosso trabalho!", // Texto para seção de mídia social
    socialMediaLinkText: "MRI QBOX", // Texto do link para seção de mídia social
    socialMediaLinkURL: "https://discord.gg/uEfGD4mmVh", // URL do link para seção de mídia social
  },
};
