# Validação do MVP 0.1

## Estado inicial e preservação

Em 29/10/2026, GitHub informou repositório público de tamanho 0 e o clone confirmou ausência de
commits. Não havia conteúdo a substituir ou instruções AGENTS.md no checkout. Foi criado um commit
mínimo com README para formar a base `main`, necessária para comparação em pull request. O MVP foi
desenvolvido na branch `feature/mvp-incident-simulation`. O playbook permanece independente e não foi alterado.

## Verificações realizadas

Node.js **24.21.0**, Windows. `npm run check` aprovado; **6 testes automatizados aprovados** em `npm test`:

1. Liberação progressiva de eventos e segunda iteração DAIR sem bloqueio linear.
2. Atribuição, papel, responsável, evidência obrigatória e preservação do estado em comandos inválidos.
3. Parecer exclusivo do facilitador, devolução, nova evidência e histórico de revisões.
4. Decisão regulatória por controlador, referências válidas, campos obrigatórios e versões preservadas.
5. Exercício completo: configuração, atividade adicional, execução, decisões, debrief e encerramento.
6. Entrega HTTP dos recursos, cabeçalhos e bloqueio de arquivos fora da lista permitida.

O teste HTTP precisou de execução com acesso à rede local; a primeira tentativa restrita falhou por
permissão de conexão, e a repetição autorizada passou. Isso não foi tratado como teste aprovado antes
da repetição. O CI executa as mesmas verificações em Node 24 / Ubuntu a cada push e pull request.

## Verificação no navegador

No navegador integrado, foram executados: início do exercício, atribuição de ACA-001 à Equipe Azul,
alternância ao papel Segurança, registro de evidência sintética com origem e horário/fuso, submissão,
parecer do facilitador com os quatro campos, aprovação e liberação do evento 2. Após recarregar,
atividade validada e segundo ciclo foram preservados. Inspeção visual confirmou plano e cronologia
lado a lado, cartões legíveis e controles de operação.

O fluxo integral de encerramento e as negativas são cobertos pelo teste do motor; não se afirma
que todas as combinações de formulários ou navegadores foram percorridas manualmente.

## Roteiro de aceite complementar

- Configurar cenário e atividade adicional antes do início; tentar configurar após início e verificar bloqueio.
- Submeter sem evidência; confirmar erro e ausência de mudança do estado.
- Devolver atividade; tentar submeter sem evidência nova; acrescentar evidência e reenviar.
- Registrar decisão técnica e regulatória; tentar esta última em Privacidade e confirmar bloqueio.
- Liberar nova exportação com atividades abertas; preservar registros e decisões anteriores.
- Referenciar decisão regulatória anterior ao reavaliar; conferir ambas no relatório.
- Concluir última rodada e tentar encerrar com pendências; concluir e validar todas, depois encerrar.
- Exportar JSON antes/depois do encerramento; conferir IDs e avaliações e ausência de eventos futuros.
- Verificar teclado, leitor de tela e telas pequenas nos navegadores usados pela organização.

## Limitações conhecidas

- Demonstração em estação compartilhada, sem identidade autenticada ou fronteira segura entre papéis.
- Um exercício por origem de navegador; sem restauração/importação, multiusuário remoto ou transações.
- Recarregamento entre abas reduz dados desatualizados, mas não elimina disputas de gravação simultânea.
- Eventos futuros existem no código/estado local. O relatório exportado omite injeções futuras.
- Sem anexos, hashes calculados, assinatura, provas forenses ou auditoria inviolável.
- Critérios e avaliações são textuais e exigem julgamento humano; campos preenchidos não garantem qualidade.
- Cenário permite título/processo/atividades adaptados, mas não editor completo de eventos ou ramificações.
- Encerramento da simulação não significa encerramento de obrigações regulatórias de um incidente real.
- Não houve implantação Cloudflare, teste de carga, auditoria de segurança ou validação jurídica formal.

Próximo marco: sessão piloto facilitada com Segurança, Privacidade e representante do controlador;
avaliar critérios e usabilidade antes de introduzir autenticação e colaboração remota.
