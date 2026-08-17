'use client';

/**
 * Conta as navegacoes feitas DENTRO do site, nesta aba.
 *
 * Porque nao `window.history.length`: se alguem chegar a uma pagina de projeto
 * a partir do LinkedIn ou de uma pesquisa, `history.length` ja e maior que 1 e
 * um `router.back()` levava a pessoa PARA FORA do site. E `document.referrer`
 * tambem nao serve, porque nao muda nas navegacoes client-side — mantem sempre
 * a origem do carregamento inicial.
 *
 * Um contador de escopo de modulo resolve exactamente isto: persiste entre
 * navegacoes suaves (o bundle nao e recarregado) e volta a zero num
 * carregamento completo — que e precisamente o sinal de que viemos de fora.
 */
let inAppNavigations = 0;

export function noteNavigation(): void {
  inAppNavigations += 1;
}

export function hasInAppHistory(): boolean {
  return inAppNavigations > 0;
}
