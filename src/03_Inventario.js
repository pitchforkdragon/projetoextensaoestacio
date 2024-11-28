// <<INÍCIO DE 03_INVENTARIO.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Switch,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
// IMPORTA CONTEXTO DE USO DA MATÉRIA-PRIMA
import { InventarioContext } from "../contexts/InventarioProvider";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function Inventario({ onNavigateBack }) {
  // VARIÁVEIS PRIMÁRIAS
  const {
    inventario,
    atualizarItemInventario,
    adicionarItem,
    excluirItensSelecionados,
  } = useContext(InventarioContext);

  // BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [newButtonScale] = useState(new Animated.Value(1));
  const [deleteButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  // FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>
// ADICIONAR NOVA MATÉRIA-PRIMA
  const addNewField = () => {
    adicionarItem({
      id: Date.now(),
      item: "",
      preco: "",
      quantidade: "",
    });
    setEditMode(true);
  }; 

// MÉTODOLOGIA DE MANUSEIO DOS ITENS SENDO EDITADOS, ENVIANDO A ATUALIZAÇAO PARA INVENTARIOPROVIDER.JS
  const handleItemChange = (index, field, value) => {
  let valorFormatado = value;

  if (field === "preco") {
    valorFormatado = value.replace(/\D/g, "");
    const valorNumerico = parseFloat(valorFormatado) / 100;
    valorFormatado = valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  if (field === "quantidade") {
    valorFormatado = value.replace(/\D/g, "");
  }
  const itemAtualizado = { ...inventario[index], [field]: valorFormatado };
  atualizarItemInventario(itemAtualizado);
};

// SELEÇÃO DE ITENS PARA EXCLUSÃO
  const toggleSelectForDeletion = (index) => {
    if (selectedForDeletion.includes(index)) {
      setSelectedForDeletion(
        selectedForDeletion.filter((selectedIndex) => selectedIndex !== index)
      );
    } else {
      setSelectedForDeletion([...selectedForDeletion, index]);
    }
  };

 // EXCLUSÃO DE ITENS
  const confirmDeletion = () => {
    const idsParaExcluir = selectedForDeletion.map(
      (index) => inventario[index].id
    );
    excluirItensSelecionados(idsParaExcluir);
    setSelectedForDeletion([]);
    setDeleteMode(false);
  };

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
        <View style={styles.titlePosition}>
          <Image source={require("../images/Logo3.png")} style={styles.logo} />
          <Text style={styles.title}>MATÉRIA-PRIMA</Text>
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

      {/* <CAMPO DE DADOS DA MATÉRIA-PRIMA - INÍCIO> */}
      <ScrollView contentContainerStyle={styles.marginUpDown}>
        {inventario.map((item, index) => (
          <View key={index} style={styles.blackLine}>
            {/* FUNÇÃO DE EXCLUSÃO - CAMPO DE DADOS DO ITEM - SWITCH */}
            {deleteMode && (
              <Switch
                value={selectedForDeletion.includes(index)}
                onValueChange={() => toggleSelectForDeletion(index)}
                style={styles.Switch}
              />
            )}

            {/* ITEM */}
            <TextInput
              value={item.item}
              editable={editMode}
              onChangeText={(text) => handleItemChange(index, "item", text)}
              placeholder="Item"
              style={styles.inputItem}
            />

            {/* PREÇO */}
            <TextInput
              value={item.preco}
              editable={editMode}
              onChangeText={(text) => handleItemChange(index, "preco", text)}
              placeholder="Preço"
              style={styles.inputPreco}
              keyboardType="numeric"
            />

            {/* QUANTIDADE */}
            <TextInput
              value={item.quantidade}
              editable={editMode}
              onChangeText={(text) =>
                handleItemChange(index, "quantidade", text)
              }
              placeholder="Qnt."
              style={styles.inputQuantidade}
              keyboardType="numeric"
            />
          </View>
        ))}
      </ScrollView>

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/* LAYOUT - BOTÃO EDITAR/SALVAR */}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO EDITAR/SALVAR - INATIVO NO MODO EXCLUIR */}
            <Button
              title={editMode ? "Concluir" : "Editar"}
              color="#333399"
              onPress={() =>
                handleButtonPress(editButtonScale, () => {
                  setEditMode(!editMode);
                })
              }
              disabled={deleteMode}
            />
          </Animated.View>

          {/* LAYOUT - BOTÃO NOVO - INATIVO NO MODO EXCLUIR */}
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: newButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/* BOTÃO NOVO */}
            <Button
              title="Novo"
              color="#333399"
              onPress={() => handleButtonPress(newButtonScale, addNewField)}
              disabled={deleteMode}
            />
          </Animated.View>

          {/* LAYOUT - BOTÕES EXCLUIR */}
        </View>
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: deleteButtonScale }] },
            ]}
          >
            {/* BOTÃO EXCLUIR */}
            {deleteMode ? (
              <Button
                title="Excluir"
                color="red"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, confirmDeletion)
                }
              />
            ) : (
              <Button
                title="Excluir"
                color="red"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, () =>
                    setDeleteMode(true)
                  )
                }
              />
            )}
          </Animated.View>

          {/* LAYOUT - BOTÃO CANCELAR - SÓ APARECE NO MODO EXCLUSÃO */}
          {deleteMode && (
            <Animated.View
              style={[
                styles.downbuttonsMargin,
                { transform: [{ scale: deleteButtonScale }] },
              ]}
            >
              {/* BOTÃO CANCELAR */}
              <Button
                title="Cancelar"
                color="green"
                onPress={() =>
                  handleButtonPress(deleteButtonScale, () =>
                    setDeleteMode(false)
                  )
                }
              />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}
// <RODAPE - FIM>
// <<INTERFACE GRÁFICA - FIM>>

// <<ESTILOS - INÍCIO>>
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
  marginUpDown: {
    padding: 90,
    paddingBottom: 93,
  },
  baseboard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    justifyContent: "center",
    backgroundColor: "#cc99ff",
    paddingHorizontal: 50,
  },
  downbuttonsDistance: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  downbuttonsMargin: {
    flex: 1,
    marginHorizontal: 10,
  },
  inactivemodeButtons: {
    opacity: 0.8,
  },

  // ESTILOS ESPECÍFICOS
  Switch: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  inputItem: {
    width: 150,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    fontSize: 16,
  },
  inputPreco: {
    width: 84,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    textAlign: "center",
    fontSize: 16,
  },
  inputQuantidade: {
    width: 46,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
  },
  blackLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
});
// << ESTILOS - FIM>>

// <<FIM DE 03_INVENTARIO.JS
