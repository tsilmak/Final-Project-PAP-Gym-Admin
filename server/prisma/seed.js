import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentStatus.createMany({
    data: [
      { paymentStatusName: "Pendente" },
      { paymentStatusName: "Pago" },
      { paymentStatusName: "Cancelado" },
      { paymentStatusName: "Reembolsado" },
    ],
    skipDuplicates: true,
  });
  await prisma.roles.createMany({
    data: [
      { rolesName: "Cliente" },
      { rolesName: "Administrador" },
      { rolesName: "Nutricionista" },
      { rolesName: "Treinador" },
    ],
    skipDuplicates: true,
  });
  await prisma.gymPlan.createMany({
    data: [
      {
        name: "Plano Gratuito",
        price: 0,
        features: [{ feature: "Exclusivo para funcionários" }],
        isActive: false,
        isHighlightedPlan: false,
      },
      {
        name: "Plano Simples",
        price: 25,
        features: [
          { feature: "Supervisão / acompanhamento de treino" },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqAgZXx2u5Jpj",
        priceStripeId: "price_1QOiKcCRniDWvC9XnknJjORY",
      },
      {
        name: "Plano Livre Acesso",
        price: 30,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqAMEjKR",
        priceStripeId: "price_1QOIaoCRniDWvC9XjJgrVflG",
      },
      {
        name: "Plano Completo",
        price: 44,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
          {
            feature: "Aulas de grupo",
          },
          {
            feature: "Reserva de aulas com 23 horas de antecedência",
          },
          {
            feature: "Aulas Bike ICG Lifefitness",
          },
          {
            feature: "Aconselhamento nutricional",
          },
        ],
        isActive: true,
        isHighlightedPlan: true,
        productStripeId: "prod_RGqCBLpwM",
        priceStripeId: "price_1QOIcACRniDWvC9Xq0tjJPoa",
      },
      {
        name: "Plano Premium",
        price: 64,
        features: [
          { feature: "Livre Trânsito" },
          {
            feature: "Supervisão / acompanhamento de treino",
          },
          {
            feature: "Avaliação e prescrição de treino individualizado",
          },
          {
            feature: "Aulas de grupo",
          },
          {
            feature: "Reserva de aulas com 23 horas de antecedência",
          },
          {
            feature: "Aulas Bike ICG Lifefitness",
          },
          {
            feature: "Aconselhamento nutricional",
          },
          {
            feature: "Aulas exclusivas",
          },
          {
            feature: "BOX (Crosstraining)",
          },
        ],
        isActive: true,
        isHighlightedPlan: false,
        productStripeId: "prod_RGqDP0a6f",
        priceStripeId: "price_1QOIXOCRniDWvC9XCrHtP009",
      },
    ],
    skipDuplicates: true,
  });
  await prisma.user.createMany({
    data: [
      // ADMIN
      {
        membershipNumber: "249758",
        email: "admin@gymhub.com",
        hashedPassword: "wxkm4Dm1bJ7hufmLKE4qnhSsU/ZROeCjBFFPFJM6me4=",
        salt: "LTw+8t3VgUZ/Gje2gF1Gl40OFpQjRa+z9ugoUFDTNuIx8F0B8gDT42zl5Xclzu5pwzJGmloR3HRMNZvyJhrltc/kfwH6JfbsVHvgNvIT+i7UBlET7A0mgANlnyvjYHLSVPtXrksp1w5edGmT3Ct1cDE/gE5QEx8aR8yK8xt/zMM=",
        fname: "Admin",
        lname: "Admin",
        phoneNumber: "351918654098",
        gender: "Masculino",
        birthDate: "1980-01-09T16:02:56Z",
        docType: "bi",
        docNumber: "123123123",
        nif: "PT123123123",
        address: "Rua das Palmeiras",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 2,
        customerStripeId: "1",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
      // Treinador
      {
        membershipNumber: "240986",
        email: "treinador@gymhub.com",
        hashedPassword: "x84xy+YQLqyNmIH2Rnq5QGXEZxU9Kc34jbxrIXQBZvE=",
        salt: "HOXrcqK+T87URw0hqmmqYFzFK/tEIAgF68IOIGceMjfKo+7uakpJAQsHSXxilSY7T3HTGRiMDUvDBB/dHsPRT+45sWsoenabudAK6aXOSqLaOkv4U6RiNiyHPxmo/Wwg5sXY60F5sgPLCJxs0my/GvIQFkJ1saJdk1wRfEkbhT4=",
        fname: "Treinador",
        lname: "Treinador",
        phoneNumber: "351910927424",
        gender: "Masculino",
        birthDate: "1990-01-09T16:02:56Z",
        docType: "bi",
        docNumber: "12233123123",
        nif: "PT1224243123123",
        address: "Rua das Palmeiras2",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 4,
        customerStripeId: "2",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
      {
        membershipNumber: "242586",
        email: "cliente@exemplo.com",
        hashedPassword: "123",
        salt: "123321321123",
        fname: "Cliente",
        lname: "Cliente",
        phoneNumber: "351920427720",
        gender: "Masculino",
        birthDate: "1999-01-09T00:00:00Z",
        docType: "bi",
        docNumber: "12233123123",
        nif: "PT1224243123123",
        address: "Rua dos Gatos",
        zipcode: "1000-100",
        country: "pt",
        city: "Lisboa",
        roleId: 1,
        customerStripeId: "21123123",
        profilePictureUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnDs2em-GXIrJHXDx0UUbQ1LRl0HpH9odQg&s",
      },
    ],
  });
  await prisma.signature.createMany({
    data: [
      {
        signatureId: 1,
        gymPlanId: 3,
        startDate: "2025-01-01T21:08:59.96Z",
        endDate: null,
        isActive: true,
        userId: 3,
      },
    ],
  });
  await prisma.payment.createMany({
    data: [
      {
        paymentId: 1,
        title: "Registo para o plano Plano Livre Acesso",
        date: "2025-01-01T21:08:59.96Z",
        amount: 29,
        signatureId: 1,
        paymentStatusId: 2,
      },
    ],
  });
}
await prisma.classType.createMany({
  data: [
    { name: "Yoga", color: "#FFD700" },
    { name: "Kickboxing", color: "#FF6347" },
    { name: "CrossFit", color: "#4682B4" },
    { name: "Spinning", color: "#32CD32" },
  ],
  skipDuplicates: true,
});
const MaquinaRemo = await prisma.machine.create({
  data: {
    name: "Remo de Água Acqua Rower",
    type: "Cardio",
    imageUrl:
      "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1734730370/hwwjdrcbkk98ztu0mr7l.jpg",
    imagePublicId: "hwwjdrcbkk98ztu0mr7l",
    description: `O Remo Acqua Rower da Titanium Strength é o produto de cardio perfeito para realizar o famoso “remo”, um dos melhores exercícios cardiovasculares para desportistas de todos os níveis.
Para se ter uma ideia, o golpe de remo usa 84% de massa muscular, fazendo assim um trabalho completo da maioria dos grupos musculares do corpo.
Um aparelho prático e robusto e útil com a máxima qualidade garantida por Titanium Strength.`,
  },
});
await prisma.exercise.createMany({
  data: [
    {
      name: "Remo Cardio Intermediário",
      exerciseType: "Cardio",
      experienceLevel: "Intermediario",
      targetMuscle: "Costas",
      secondaryMuscle: "Braços, Ombros, Abdômen, Pernas",
      commentsAndTips: [
        "Curvar a coluna durante a puxada, especialmente na fase final, pode causar tensão nas costas.",
        "Fazer a puxada com os braços antes de usar as pernas resulta em uma remada ineficaz e pode causar lesões nos ombros.",
        "Movimentos rápidos e descontrolados: A velocidade deve ser constante e controlada, focando na técnica e não na rapidez.",
        "Procurar demasiado resistência logo no início. Começar com uma resistência muito alta pode prejudicar a técnica, especialmente para iniciantes.",
        "O remo de água é um exercício de baixo impacto, mas exige uma boa coordenação entre pernas, tronco e braços para ser eficaz.",
      ],
      execution: [
        "Sente-se no banco e coloca os pés nos pedais, ajustando as tiras para que fiquem confortáveis, mantendo os joelhos ligeiramente dobrados.",
        "Segura o remo com as duas mãos, mantendo os braços esticados à frente do corpo.",
        "Inclina o tronco ligeiramente para frente, mantendo a postura ereta e as costas alinhadas.",
        "Empurra com as pernas, usando os quadríceps e glúteos para impulsionar o corpo para trás.",
        "Ao empurrar, puxa o remo em direção ao teu peito, dobrando os cotovelos e mantendo as costas esticadas.",
        "Mantenha o tronco reto e os ombros relaxados durante a fase de puxada.",
        "Chega o remo até ao peito com os cotovelos apontados para trás e os ombros ligeiramente retraídos.",
        "Reverte o movimento, esticando os braços e permitindo que o tronco se incline ligeiramente para a frente.",
        "Desce as pernas, voltando à posição inicial com os joelhos ligeiramente dobrados.",
        "Repete o movimento de forma contínua, coordenando o movimento das pernas, tronco e braços de forma fluida e controlada.",
      ],
      videoUrl: "https://www.youtube.com/watch?v=0fQjXZY_FtY&themeRefresh=1",
      imageUrl:
        "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1735009961/v0fgwt5vkzfhiz99jh6c.png",
      imagePublicId: "v0fgwt5vkzfhiz99jh6c",
      equipmentId: MaquinaRemo.MachineId,
    },
  ],
});

await prisma.blogCategory.createMany({
  data: [
    {
      categoryId: 1,
      name: "Treinos e Exercícios",
    },
    {
      categoryId: 2,
      name: "Nutrição e Dieta",
    },
    {
      categoryId: 3,
      name: "Saúde e Bem-estar",
    },
    {
      categoryId: 4,
      name: "Tecnologia e Inovação no Fitness",
    },
    {
      categoryId: 5,
      name: "Histórias de Sucesso e Motivação",
    },
    {
      categoryId: 6,
      name: "Gestão de Ginásios",
    },
    {
      categoryId: 7,
      name: "Treinamento Funcional",
    },
    {
      categoryId: 8,
      name: "Fitness para Idosos",
    },
    {
      categoryId: 9,
      name: "Mindfulness e Yoga",
    },
    {
      categoryId: 10,
      name: "Equipamentos de Ginásio",
    },
    {
      categoryId: 11,
      name: "Desafios e Competências Fitness",
    },
    {
      categoryId: 12,
      name: "Moda Fitness e Roupas para Treino",
    },
    {
      categoryId: 13,
      name: "Treinamento Mental e Psicologia do Esporte",
    },
  ],
});

await prisma.blog.createMany({
  data: [
    {
      blogId: "31a51d3d-7e08-41b6-9fbc-4a131120e495",
      title:
        "A Importância da Nutrição Balanceada: Como Escolher a Dieta Certa para o Seu Corpo",
      body: `
        <p>A alimentação é um dos pilares essenciais para a manutenção de uma vida saudável e equilibrada. Uma nutrição adequada não apenas promove a saúde física, mas também impacta diretamente o nosso bem-estar emocional e mental. No entanto, com tantas dietas e modismos alimentares a surgirem a cada dia, pode ser difícil saber qual é a escolha certa para o seu corpo e estilo de vida.</p>
        <p>Neste artigo, vamos explorar a importância de uma dieta balanceada, desmistificar os diferentes tipos de planos alimentares e dar-lhe as ferramentas necessárias para tomar decisões mais informadas sobre a sua nutrição.</p>
        <h3><strong>O que é uma Nutrição Balanceada?</strong></h3>
        <p>Nutrição balanceada significa consumir uma variedade de alimentos que forneçam ao corpo os nutrientes essenciais para o seu funcionamento adequado. Estes nutrientes incluem proteínas, carboidratos, gorduras saudáveis, vitaminas e minerais. Quando o corpo recebe os nutrientes certos em quantidades apropriadas, é capaz de funcionar de forma mais eficiente, melhorar a energia e reduzir o risco de doenças crónicas.</p>
        <h4><strong>Principais Nutrientes e as Suas Funções:</strong></h4>
        <ol>
          <li><strong>Proteínas</strong>: Essenciais para o crescimento muscular, reparação de tecidos e funções do sistema imunológico.</li>
          <li><strong>Carboidratos</strong>: Fonte principal de energia, especialmente para a função cerebral e atividades físicas.</li>
          <li><strong>Gorduras saudáveis</strong>: Necessárias para o funcionamento do sistema nervoso e a absorção de vitaminas lipossolúveis.</li>
          <li><strong>Vitaminas e Minerais</strong>: Cruciais para uma variedade de processos no corpo, incluindo a regulação do metabolismo e o apoio ao sistema imunológico.</li>
        </ol>
        <h3><strong>Diferentes Tipos de Dietas: Qual é a Melhor para Si?</strong></h3>
        <p>Com a popularidade de dietas específicas como a cetogénica, vegana ou paleo, pode ser tentador seguir a última tendência sem considerar se ela é adequada ao seu corpo ou objetivos. É importante entender que cada pessoa tem necessidades nutricionais diferentes, e o que funciona para uma pessoa pode não ser ideal para outra.</p>
        <p>Aqui estão algumas dietas populares e os seus benefícios:</p>
        <h4><strong>1. Dieta Mediterrânica</strong></h4>
        <p>Focada em alimentos frescos e naturais, como frutas, vegetais, peixes, azeite e grãos integrais, esta dieta é reconhecida pelos seus benefícios para a saúde cardiovascular e longevidade.</p>
        <h4><strong>2. Dieta Cetogénica</strong></h4>
        <p>Composta principalmente por gorduras saudáveis, proteínas e uma quantidade muito reduzida de carboidratos, a dieta cetogénica visa colocar o corpo em estado de cetose, o que pode ajudar na perda de peso.</p>
        <h4><strong>3. Dieta Vegana</strong></h4>
        <p>Exclui todos os produtos de origem animal, focando-se em vegetais, leguminosas, nozes e sementes. É rica em fibras e antioxidantes, mas exige planejamento para garantir que todos os nutrientes sejam obtidos.</p>
        <h4><strong>4. Dieta Paleo</strong></h4>
        <p>Baseada no consumo de alimentos que nossos ancestrais caçadores-recolectores comiam, a dieta paleo evita alimentos processados, laticínios, grãos e leguminosas, priorizando carnes magras, peixes, frutas e vegetais.</p>
        <h3><strong>Como Escolher a Dieta Certa para Si?</strong></h3>
        <p>A escolha da dieta ideal deve ser personalizada e baseada em vários fatores, incluindo os seus objetivos de saúde, condições médicas, nível de atividade física e preferências alimentares. Consultar um nutricionista é sempre uma excelente opção, pois ele pode criar um plano alimentar que atenda às suas necessidades específicas.</p>
        <ol>
          <li><strong>Defina os seus objetivos</strong>: Quer perder peso, melhorar a saúde cardiovascular ou aumentar a massa muscular? Isso pode influenciar a sua escolha alimentar.</li>
          <li><strong>Considere o seu estilo de vida</strong>: Se é uma pessoa com uma agenda ocupada, opte por uma dieta prática e fácil de seguir.</li>
          <li><strong>Evite modismos</strong>: Lembre-se de que uma dieta equilibrada é mais eficaz e sustentável do que seguir as últimas tendências.</li>
        </ol>
        <h3><strong>A Importância da Hidratação e do Equilíbrio</strong></h3>
        <p>Além de uma alimentação saudável, a hidratação desempenha um papel crucial na manutenção do bem-estar. A água é fundamental para a digestão, transporte de nutrientes e regulação da temperatura corporal. Manter-se hidratado é uma prática simples, mas muitas vezes negligenciada.</p>
        <p>Por fim, lembre-se de que a chave para uma vida saudável não está em restrições extremas, mas sim em equilíbrio. A nutrição é uma jornada contínua que envolve escolhas alimentares conscientes, prática regular de exercício físico e um bom descanso.</p>
        <h3><strong>Conclusão</strong></h3>
        <p>Nutrição e dieta são mais do que simples escolhas alimentares; são a base para uma vida longa e saudável. Ao compreender as suas necessidades nutricionais e adotar uma dieta equilibrada, pode melhorar a sua saúde geral e aumentar a qualidade de vida. Lembre-se de que cada corpo é único e merece um plano alimentar personalizado. E, acima de tudo, faça sempre escolhas que sejam sustentáveis a longo prazo, para que a saúde não seja apenas um objetivo, mas um estilo de vida.</p>
      `,
      coverImageUrl:
        "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1736715275/eb2u1rxxf14wybghjx4q.jpg",
      coverImagePublicId: "eb2u1rxxf14wybghjx4q",
      published: true,
      createdAt: new Date("2025-01-12T20:54:36.447Z"),
      updatedAt: new Date("2025-01-12T20:54:36.447Z"),
    },
  ],
});

await prisma.blogAuthor.createMany({
  data: [
    {
      blogId: "31a51d3d-7e08-41b6-9fbc-4a131120e495",
      userId: 1,
    },
    { blogId: "31a51d3d-7e08-41b6-9fbc-4a131120e495", userId: 2 },
  ],
});

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
