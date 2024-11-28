// <<INÍCIO DE APP.JS>>
// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useState, useRef, useEffect } from "react";
import { View, Animated } from "react-native";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<IMPORTAÇÃO DE ROTINAS - INÍCIO>>
import Home from "./src/00_Home";
import Loja from "./src/01_Loja";
import Cliente from "./src/02_Cliente";
import Inventario from "./src/03_Inventario";
import Produtos from "./src/04_Produtos";
import Estoque from "./src/05_Estoque";
import Caixa from "./src/06_Caixa";
import LoadingScreen from "./src/LoadingScreen";
// <<IMPORTAÇÃO DE ROTINAS - FIM>>

// <<IMPORTAÇÃO DE CONTEXTO - INÍCIO>>
import { InventarioProvider } from "./contexts/InventarioProvider";
import { ProdutosProvider } from "./contexts/ProdutosProvider";
import { EstoqueProvider } from "./contexts/EstoqueProvider";
// <<IMPORTAÇÃO DE CONTEXTO - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function App() {
  const [currentScreen, setCurrentScreen] = useState("loading");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ANIMAÇÃO DE ABERTURA DO APLICATIVO
  useEffect(() => {
    if (currentScreen === "home") {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [currentScreen, fadeAnim]);

  // DEFINIÇÃO QUE SOLICITA QUE A PÁGINA INICIAL SEJA HOME.JS
  const onLoadingComplete = () => {
    setCurrentScreen("home");
  };

  // DEFINIÇÃO DE ACESSO A CADA JANELA CONFORME SOLICITAÇÃO DO USUÁRIO
  const navigateTo = (screenName) => {
    setCurrentScreen(screenName);
  };
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<CONFIGURAÇÃO DO APLICATIVO - INÍCIO>>
  // DEFINIÇÃO DA ORDEM DOS PROVIDERS EM RELAÇÃO AS DEMAIS JANELAS
  return (
    <InventarioProvider>
      <EstoqueProvider>
        <ProdutosProvider>
                    {/*COMPORTAMENTO DA LOADINGSCREEN.JS*/}
          <View style={{ flex: 1 }}>
            {currentScreen === "loading" && (
              <LoadingScreen onLoadingComplete={onLoadingComplete} />
            )}
                        {/*COMPORTAMENTO DA HOMESCREEN.JS*/}
            {currentScreen === "home" && (
              <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <Home
                  onNavigateToLoja={() => navigateTo("loja")}
                  onNavigateToCliente={() => navigateTo("cliente")}
                  onNavigateToInventario={() => navigateTo("inventario")}
                  onNavigateToProdutos={() => navigateTo("produtos")}
                  onNavigateToEstoque={() => navigateTo("estoque")}
                  onNavigateToCaixa={() => navigateTo("caixa")}
                />
              </Animated.View>
            )}
                        {/*COMANDO DE RETORNO DE TODAS A ROTINAS PARA HOMESCREEN.JS QUANDO SOLICITADO*/}
            {currentScreen === "loja" && (
              <Loja onNavigateBack={() => navigateTo("home")} />
            )}
            {currentScreen === "cliente" && (
              <Cliente onNavigateBack={() => navigateTo("home")} />
            )}
            {currentScreen === "inventario" && (
              <Inventario onNavigateBack={() => navigateTo("home")} />
            )}
            {currentScreen === "produtos" && (
              <Produtos onNavigateBack={() => navigateTo("home")} />
            )}
            {currentScreen === "estoque" && (
              <Estoque onNavigateBack={() => navigateTo("home")} />
            )}
            {currentScreen === "caixa" && (
              <Caixa onNavigateBack={() => navigateTo("home")} />
            )}
          </View>
        </ProdutosProvider>
      </EstoqueProvider>
    </InventarioProvider>
  );
}
// <<CONFIGURAÇÃO DO APLICATIVO - FIM>>
// <<FIM DE APP.JS>>
