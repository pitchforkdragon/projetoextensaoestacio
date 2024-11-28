// <<INÍCIO DE 00_HOME.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function Home({
  onNavigateToLoja,
  onNavigateToCliente,
  onNavigateToInventario,
  onNavigateToProdutos,
  onNavigateToEstoque,
  onNavigateToCaixa,
}) {

  // BOTÕES DO MENU
  const [lojaButtonScale] = useState(new Animated.Value(1));
  const [clienteButtonScale] = useState(new Animated.Value(1));
  const [inventarioButtonScale] = useState(new Animated.Value(1));
  const [produtosButtonScale] = useState(new Animated.Value(1));
  const [estoqueButtonScale] = useState(new Animated.Value(1));
  const [caixaButtonScale] = useState(new Animated.Value(1));
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
  // ANIMAÇÃO DOS BOTÕES
  const handleButtonPress = (buttonScale, callback) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };
  // <<IMPLEMENTAÇAO DE FUNÇÕES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  // <CABEÇALHO - INÍCIO>
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <Image source={require("../images/Logo2.png")} style={styles.logo} />
      </View>
      {/* <CABEÇALHO - FIM> */}

      <View style={styles.menu}>
        {/* BOTÃO - LOJA */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: lojaButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() => handleButtonPress(lojaButtonScale, onNavigateToLoja)}
          >
            <Button
              title="Loja"
              color="#333399"
              onPress={() =>
                handleButtonPress(lojaButtonScale, onNavigateToLoja)
              }
            />
          </TouchableOpacity>
        </Animated.View>

        {/* BOTÃO - CLIENTE */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: clienteButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() =>
              handleButtonPress(clienteButtonScale, onNavigateToCliente)
            }
          >
            <Button
              title="Cliente"
              color="#333399"
              onPress={() =>
                handleButtonPress(clienteButtonScale, onNavigateToCliente)
              }
            />
          </TouchableOpacity>
        </Animated.View>

        {/* BOTÃO - MATÉRIA-PRIMA */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: inventarioButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() =>
              handleButtonPress(inventarioButtonScale, onNavigateToInventario)
            }
          >
            <Button
              title="Matéria-Prima"
              color="#333399"
              onPress={() =>
                handleButtonPress(inventarioButtonScale, onNavigateToInventario)
              }
            />
          </TouchableOpacity>
        </Animated.View>

        {/* BOTÃO - PRODUTOS */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: produtosButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() =>
              handleButtonPress(produtosButtonScale, onNavigateToProdutos)
            }
          >
            <Button
              title="Produtos"
              color="#333399"
              onPress={() =>
                handleButtonPress(produtosButtonScale, onNavigateToProdutos)
              }
            />
          </TouchableOpacity>
        </Animated.View>

        {/* BOTÃO - ESTOQUE */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: estoqueButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() =>
              handleButtonPress(estoqueButtonScale, onNavigateToEstoque)
            }
          >
            <Button
              title="Estoque"
              color="#333399"
              onPress={() =>
                handleButtonPress(estoqueButtonScale, onNavigateToEstoque)
              }
            />
          </TouchableOpacity>
        </Animated.View>

        {/* BOTÃO - CAIXA */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: caixaButtonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableButton}
            onPress={() =>
              handleButtonPress(caixaButtonScale, onNavigateToCaixa)
            }
          >
            <Button
              title="Caixa"
              color="#333399"
              onPress={() =>
                handleButtonPress(caixaButtonScale, onNavigateToCaixa)
              }
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
// <<INTERFACE GRÁFICA - FIM>>

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#ffccff",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 291,
    height: 200,
  },
  menu: {
    height: 400,
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  touchableButton: {
    flex: 1,
  },
});
// << ESTILOS - FIM>>

// <<FIM DE 00_HOME.JS>>
