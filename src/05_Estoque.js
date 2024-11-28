// <<INÍCIO DE 05_ESTOQUE.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { EstoqueContext } from "../contexts/EstoqueProvider";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function Estoque({ onNavigateBack }) {
  // VARIÁVEIS PRIMÁRIAS
  const { estoque, atualizarItemEstoque } = useContext(EstoqueContext);

  // BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  // FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);

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

  // MÉTODOLOGIA DE MANUSEIO DA QUANTIDADE DE ESTOQUE EM MODO EDIÇÃO, ENVIANDO A ATUALIZAÇAO PARA ESTOQUEPROVIDER.JS
  const handleQuantityChange = (itemId, value) => {
    const itemIndex = estoque.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      const itemAtualizado = { ...estoque[itemIndex], quantidade: value };
      atualizarItemEstoque(itemAtualizado);
    }
  };

  // FUNÇÕES PARA INCREMENTAR E DECREMENTAR A QUANTIDADE
  const incrementQuantity = (itemId) => {
    const itemIndex = estoque.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      const itemAtualizado = {
        ...estoque[itemIndex],
        quantidade: parseInt(estoque[itemIndex].quantidade || 0) + 1,
      };
      atualizarItemEstoque(itemAtualizado);
    }
  };

  const decrementQuantity = (itemId) => {
    const itemIndex = estoque.findIndex((item) => item.id === itemId);
    if (
      itemIndex !== -1 &&
      parseInt(estoque[itemIndex].quantidade || 0) > 0
    ) {
      const itemAtualizado = {
        ...estoque[itemIndex],
        quantidade: parseInt(estoque[itemIndex].quantidade || 0) - 1,
      };
      atualizarItemEstoque(itemAtualizado);
    }
  };
  // <<DEFINIÇAO DE COMPONENTES - FIM>>

  // <<INTERFACE GRÁFICA - INÍCIO>>
  // <CABEÇALHO - INÍCIO>
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <View style={styles.titlePosition}>
          <Image source={require("../images/Logo3.png")} style={styles.logo} />
          <Text style={styles.title}>ESTOQUE</Text>
        </View>

        {/* BOTÃO VOLTAR */}
        <Animated.View
          style={[
            styles.backButton,
            { transform: [{ scale: backButtonScale }] },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              handleButtonPress(backButtonScale, () => onNavigateBack())
            }
          >
            <Text style={styles.backButtonText}>VOLTAR</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* <CABEÇALHO - FIM> */}

      {/* <CAMPO DE DADOS DOS PRODUTOS EM ESTOQUE - INÍCIO> */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {estoque.map((item, index) => (
          <View key={index} style={styles.estoqueItem}>
            {/* PRODUTO EM ESTOQUE */}
            <View style={styles.produtoContainer}>
              <Text style={styles.produtoNome}>{item.produto}</Text>
            </View>

            {/* QUANTIDADE DE PRODUTOS EM ESTOQUE */}
            <View style={styles.quantidadeContainer}>
              <TouchableOpacity
                style={styles.quantidadeButton}
                onPress={() => decrementQuantity(item.id)}
              >
                <Text style={styles.quantidadeButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantidadeInput}
                value={item.quantidade ? item.quantidade.toString() : "0"}
                keyboardType="numeric"
                editable={editMode}
                onChangeText={(text) => handleQuantityChange(item.id, text)}
              />
              <TouchableOpacity
                style={styles.quantidadeButton}
                onPress={() => incrementQuantity(item.id)}
              >
                <Text style={styles.quantidadeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* <CAMPO DE DADOS DOS PRODUTOS EM ESTOQUE - FIM> */}

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/* LAYOUT - BOTÃO EDITAR QUANTIDADE/SALVAR QUANTIDADE */}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
            ]}
          >
            {/* BOTÃO EDITAR QUANTIDADE/SALVAR QUANTIDADE */}
            <Button
              title={editMode ? "Salvar Quantidade" : "Editar Quantidade"}
              color="#333399"
              onPress={() =>
                handleButtonPress(editButtonScale, () => {
                  setEditMode(!editMode);
                })
              }
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
// <RODAPÉ - FIM>
// <<INTERFACE GRÁFICA - FIM>>

// ESTILOS
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  // ESTILOS PADRÃO
  background: {
    flex: 1.0,
    backgroundColor: "#ffccff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#cc99ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    zIndex: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  titlePosition: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#333399",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContainer: {
    paddingTop: 85,
    paddingBottom: 85,
    paddingHorizontal: 10,
  },
  baseboard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#cc99ff",
    paddingHorizontal: 50,
    justifyContent: "center",
  },
  downbuttonsDistance: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  downbuttonsMargin: {
    flex: 1,
    marginHorizontal: 10,
  },

  // ESTILOS ESPECÍFICOS
  estoqueItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  produtoContainer: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
  },
  quantidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantidadeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0000FF",
    borderWidth: 1,
    borderColor: "#330066",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantidadeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  quantidadeInput: {
    width: 60,
    height: 50,
    borderWidth: 1,
    borderColor: "#330066",
    borderRadius: 5,
    textAlign: "center",
    fontSize: 18,
  },
});
// << ESTILOS - FIM>>

// <<FIM DE 05_ESTOQUE.JS>>