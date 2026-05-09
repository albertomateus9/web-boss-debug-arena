# Arena Chefão Web: Depuração

Arena de depuração em que equipes corrigem desafios visuais, acessibilidade, formulários e responsividade em rodadas lúdicas.

> Projeto educacional inspirado na EETEPA Vilhena Alves. Não é sistema oficial institucional e não usa dados reais de estudantes.

## Visão Geral

**Código:** L-06  
**Foco disciplinar:** Tecnologias Web, Design e Lógica de Programação  
**Formato:** jogo web conduzido pelo professor  
**Tempo sugerido:** 25 a 35 minutos  
**Demonstração pública:** https://albertomateus9.github.io/web-boss-debug-arena/

Este projeto transforma uma aula técnica em uma missão guiada. O professor cria equipes fictícias, inicia o cronômetro, revela fases, pontua evidências e exporta relatório da aula.

## Roteiro Do Professor

- **Objetivo:** Transformar falhas comuns de interface web em desafios rápidos e cooperativos.
- **Preparação:** Explique que cada rodada exige observar, formular hipótese e propor correção.
- **Condução:** Peça que a equipe diga qual sintoma viu, qual causa suspeita e qual ajuste faria.
- **Fechamento:** Conecte as respostas a boas práticas de acessibilidade e responsividade.
- **Critérios:** use a rubrica do app para pontuar evidência, colaboração, comunicação e melhoria.

## Missões

- **Corrigir o Bug Visual (6 min):** Identificar se o bug provável é margem, display ou tamanho de fonte. Evidência: Tipo de bug e nota de correção.
- **Liberar a Acessibilidade (8 min):** Escolher a melhoria em HTML que torna o controle mais claro. Evidência: Correção de acessibilidade.
- **Vencer o Chefão do Celular (9 min):** Propor correção com media query, grid ou flexbox. Evidência: Plano de correção responsiva.

## Competências

- depuração
- acessibilidade
- design responsivo
- raciocínio de interface web

## Como Rodar

Abra `index.html` diretamente ou sirva a pasta:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Política De Dados

- Usa apenas missões sintéticas e equipes fictícias.
- Guarda estado apenas no `localStorage` do navegador.
- Não possui login, servidor, API externa ou registro real de estudante.

## Licença

MIT. Consulte [LICENSE](LICENSE).
