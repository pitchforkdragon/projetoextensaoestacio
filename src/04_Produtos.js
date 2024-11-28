// <<INÍCIO DE 04_PRODUTOS.JS

// IMPORTA ITENS DA MATÉRIA-PRIMA PARA USO EM 04_PRODUTOS.JS
import React, { useContext, useState } from "react";
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
  TouchableHighlight,
  Modal,
  FlatList,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
// IMPORTA ITENS DA MATÉRIA-PRIMA PARA USO EM PRODUTOSPROVIDER.JS
import { InventarioContext } from "../contexts/InventarioProvider";
// EXPORTA PRODUTOS PARA USO EM ESTOQUEPROVIDER.JS
import { ProdutosContext } from "../contexts/ProdutosProvider";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
export default function Produtos({ onNavigateBack }) {
  // VARIÁVEIS PRIMÁRIAS
  const { produtos, adicionarNovoProduto, excluirProdutos, atualizarProduto } =
    useContext(ProdutosContext);
  const { inventario } = useContext(InventarioContext);

  // VARIÁVEIS SECUNDÁRIAS
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  // VARIÁVEIS AUXILIARES
  const [hiddenFields, setHiddenFields] = useState([]);
  const [modalScreen, setModalScreen] = useState(false);

  // BOTÕES
  const [editButtonScale] = useState(new Animated.Value(1));
  const [newButtonScale] = useState(new Animated.Value(1));
  const [deleteButtonScale] = useState(new Animated.Value(1));
  const [backButtonScale] = useState(new Animated.Value(1));

  // FUNÇÕES DOS BOTÕES
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [selectedItemsForDeletion, setSelectedItemsForDeletion] = useState({});
  // <<DEFINIÇÃO DOS COMPONENTES - FIM>>

  // <<IMPLEMENTAÇÃO DE FUNÇÕES - INÍCIO>>

 // MÉTODOLOGIA DE ADIÇÃO DE NOVA MATÉRIA-PRIMA AO PRODUTO SELECIONADO
  const handleItemSelection = (productIndex, itemIndex = null) => {
    setCurrentProductIndex(productIndex);
    setCurrentItemIndex(itemIndex);
    setModalScreen(true);
  };

  // MÉTODOLOGIA DE ALTERAÇÃO DOS VALORES DOS PRODUTOS
  const handleProductChange = (index, field, value) => {
    const updatedProdutos = [...produtos];
    updatedProdutos[index][field] = value;
    atualizarProduto(updatedProdutos[index]);
  };

 // CONTROLE DE VISIBILIDADE DAS ABAS OCULTAS
  const toggleFieldsVisibility = (index) => {
    const updatedVisibility = [...hiddenFields];
    updatedVisibility[index] = !updatedVisibility[index];
    setHiddenFields(updatedVisibility);
  };

 // MÉTODOLOGIA DE ALTERAÇÃO DA QUANTIDADE NECESSÁRIA DE UMA DETERMINADA MATÉRIA-PRIMA EM UM PRODUTO
  const handleNecessarioChange = (productIndex, itemIndex, value) => {
    const updatedProdutos = [...produtos];
    updatedProdutos[productIndex].itens[itemIndex].necessario = value;
    atualizarProduto(updatedProdutos[productIndex]);
  };

  // METODOLOGIA DE SELEÇÃO DE MATÉRIA-PRIMA DE 03_INVENTARIO.JS - GARANTE QUE NÃO SE SELECIONE A MESMA MATÉRIA-PRIMA MAIS DE UMA VEZ PARA UM PRODUTO
  const selectInventarioItem = (selectedItem) => {
    if (currentProductIndex !== null) {
      const updatedProdutos = [...produtos];
      const currentProduct = updatedProdutos[currentProductIndex];
      if (currentItemIndex !== null) {
        currentProduct.itens[currentItemIndex] = {
          ...currentProduct.itens[currentItemIndex],
          item: selectedItem.item,
          preco: selectedItem.preco,
          necessario: currentProduct.itens[currentItemIndex].necessario || "",
        };
      } else {
        const itemExists = currentProduct.itens.some(
          (item) => item.item === selectedItem.item
        );
        if (itemExists) {
          Alert.alert(
            "Item já adicionado",
            "Este item já foi adicionado ao produto."
          );
        } else {
          currentProduct.itens.push({
            item: selectedItem.item,
            preco: selectedItem.preco,
            necessario: "",
          });
        }
      }
      atualizarProduto(currentProduct);
      setModalScreen(false);
      setCurrentProductIndex(null);
      setCurrentItemIndex(null);
    }
  };

  // CÁLCULO DO CUSTO DE CONFECÇÃO DE UM PRODUTO COM BASE NA MATÉRIA-PRIMA - PARA USO EM CUSTO
  const calculateTotalPrice = (itens) => {
    return itens.reduce((total, item) => {
      const preco =
        typeof item.preco === "number"
          ? item.preco
          : parseFloat(
              item.preco.replace(/[R$\s.]/g, "").replace(",", ".") || 0
            );
      const necessario = parseInt(item.necessario) || 0;
      return total + preco * necessario;
    }, 0);
  };

  // CÁLCULO DE CAPACIDADE/DISPONIBILIDADE DE CONFECÇÃO DO PRODUTO - PARA USO EM CRAFT
  const productAvaiability = (itens) => {
    if (!itens || itens.length === 0) {
      return 0;
    }
    return itens.reduce((min, item) => {
      const inventarioItem = inventario.find(
        (invItem) => invItem.item === item.item
      );
      if (!inventarioItem) {
        return 0;
      }
      const disponivel = parseInt(inventarioItem.quantidade) || 0;
      const necessario = parseInt(item.necessario) || 0;
      const producoesPossiveis = Math.floor(disponivel / necessario);
      return min !== null
        ? Math.min(min, producoesPossiveis)
        : producoesPossiveis;
    }, null);
  }; 

  // SWITCH - EXCLUSÃO DE PRODUTOS
  const toggleProductSwitch = (index) => {
    if (selectedForDeletion.includes(index)) {
      setSelectedForDeletion(
        selectedForDeletion.filter((selectedIndex) => selectedIndex !== index)
      );
    } else {
      setSelectedForDeletion([...selectedForDeletion, index]);
    }
  };

  // SWITCH - EXCLUSÃO DE MATÉRIAS-PRIMA
  const toggleItemSwitch = (productId, itemIndex) => {
    setSelectedItemsForDeletion((prevState) => {
      const productItems = prevState[productId] || [];
      if (productItems.includes(itemIndex)) {
        return {
          ...prevState,
          [productId]: productItems.filter((index) => index !== itemIndex),
        };
      } else {
        return {
          ...prevState,
          [productId]: [...productItems, itemIndex],
        };
      }
    });
  };

  // EXCLUSÃO DE PRODUTOS E MATÉRIA-PRIMA
  const confirmDeletion = () => {
    const produtosAtualizados = produtos
      .filter((_, index) => !selectedForDeletion.includes(index))
      .map((produto) => {
        const itensParaExcluir = selectedItemsForDeletion[produto.id] || [];
        const itensAtualizados = produto.itens.filter(
          (_, index) => !itensParaExcluir.includes(index)
        );
        return { ...produto, itens: itensAtualizados };
      });    
    produtosAtualizados.forEach((produto) => atualizarProduto(produto));    
    const idsParaExcluir = selectedForDeletion.map(
      (index) => produtos[index].id
    );
    excluirProdutos(idsParaExcluir);    
    setSelectedForDeletion([]);
    setSelectedItemsForDeletion({});
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
          <Text style={styles.title}>PRODUTOS</Text>
        </View>

        {/*BOTÃO VOLTAR*/}
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

      {/* <MODAL - SELEÇÃO DE MATÉRIA-PRIMA DE 03_INVENTÁRIO.JS - INÍCIO> */}
      <Modal visible={modalScreen} transparent={true}>
        <View style={styles.modalWindow}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <FlatList
                data={inventario}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableHighlight
                    onPress={() => selectInventarioItem(item)}
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalText}>{item.item}</Text>
                  </TouchableHighlight>
                )}
              />
              <TouchableOpacity onPress={() => setModalScreen(false)}>
                <Text style={styles.modalCancelButton}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      {/* <MODAL - SELEÇÃO DE MATÉRIA-PRIMA DE 03_INVENTÁRIO.JS - FIM> */}
      
      {/* <CAMPO DE DADOS DO PRODUTO - INÍCIO> */}
      <ScrollView contentContainerStyle={styles.marginUpDown}>
        {produtos.map((product, index) => {
          // CÁLCULO RÁPIDO DO CUSTO DE UM PRODUTO COM BASE EM SUA MATÉRIA-PRIMA
          const calculatedCusto = calculateTotalPrice(product.itens);
          const formattedCusto = calculatedCusto.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          const calculatedConfeccao = productAvaiability(product.itens);

          return (
            <View key={index} style={styles.blackLine}>      
              <View style={styles.spaceBetweenProduto}>
                {/*FUNÇÃO DE EXCLUSÃO - CAMPO DE DADOS DO PRODUTO - SWITCH*/}
                {deleteMode && (
                  <Switch
                    value={selectedForDeletion.includes(index)}
                    onValueChange={() => toggleProductSwitch(index)}
                    style={styles.SwitchProduto}
                  />
                )}

                {/*PRODUTO*/}
                <TextInput
                  value={product.nomeProduto}
                  editable={editMode}
                  onChangeText={(text) =>
                    handleProductChange(index, "nomeProduto", text)
                  }
                  placeholder="Nome do Produto"
                  style={styles.inputProduto}
                />

                {/* CUSTO DE PRODUÇÃO */}
                <TextInput
                  value={formattedCusto}
                  editable={false}
                  placeholder="Custo"
                  style={styles.inputCusto}
                  keyboardType="numeric"
                />

                {/* DISPONIBILIDADE COM BASE NA QUANTIDADE REQUERIDA E A MATÉRIA PRIMA COM A MENOR QUANTIDADE REQUERIDA DISPONÍVEL */}
                <TextInput
                  value={String(calculatedConfeccao)}
                  editable={false}
                  placeholder="Cnf."
                  style={styles.inputConfeccao}
                  keyboardType="numeric"
                />

                {/*SETAS PARA ABA OCULTA*/}
                <TouchableOpacity onPress={() => toggleFieldsVisibility(index)}>
                  <Text style={styles.arrow}>
                    {hiddenFields[index] ? "▼" : "►"}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <CAMPO DE DADOS DO PRODUTO - FIM> */}

              {/* <ABA OCULTA - INÍCIO>*/}
              {hiddenFields[index] && (
                <View>
                  <View style={styles.pointyLine} />
                  {product.itens.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.spaceBetweenItem}>
                      {/*FUNÇÃO DE EXCLUSÃO - CAMPO DE MATÉRIA-PRIMA - SWITCH*/}
                      {deleteMode && (
                        <Switch
                          value={
                            selectedItemsForDeletion[product.id]?.includes(
                              itemIndex
                            ) || false
                          }
                          onValueChange={() =>
                            toggleItemSwitch(product.id, itemIndex)
                          }
                          style={styles.SwitchItem}
                        />
                      )}
                      {/*CHAMA PELO MODAL PARA ESCOLHA DE UMA MATÉRIA-PRIMA - RECUPERADO DE INVENTARIOPROVIDER.JS*/}
                      <TouchableHighlight
                        style={styles.inputItem}
                        onPress={() => {
                          if (editMode) {
                            handleItemSelection(index, itemIndex);
                          }
                        }}
                        underlayColor={editMode ? "#DDD" : null}
                      >
                        <Text>{item.item || "Selecione um item"}</Text>
                      </TouchableHighlight>

                      {/*PREÇO DA MATÉRIA-PRIMA - RECUPERADO DE INVENTARIOPROVIDER.JS*/}
                      <TextInput
                        value={item.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        editable={false}
                        placeholder="Preço"
                        style={styles.inputPreco}
                        keyboardType="numeric"
                      />

                      {/*QUANTO É NECESSÁRIO DA MATÉRIA-PRIMA PARA PRODUZIR UM PRODUTO ESPECÍFICO*/}
                      <TextInput
                        value={item.necessario}
                        editable={editMode}
                        onChangeText={(text) =>
                          handleNecessarioChange(index, itemIndex, text)
                        }
                        placeholder="Nc."
                        style={styles.inputNecessario}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}

                  {/* <BOTÕES - ADICIONAR MATÉRIA-PRIMA E PREÇO*/}
                  {editMode && (
                    <View style={[styles.buttonContainer, { marginTop: 10 }]}>
                      <TouchableOpacity
                        onPress={() => {
                          setCurrentProductIndex(index);
                          setCurrentItemIndex(null);
                          setModalScreen(true);
                        }}
                      >
                        <Text style={styles.addButton}>Nova Matéria-Prima</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              <View style={styles.divisoria} />
            </View>
          );
        })}
      </ScrollView>
      {/* <ABA OCULTA - FIM>*/}

      {/* <RODAPE - INÍCIO> */}
      <View style={styles.baseboard}>
        {/*LAYOUT - BOTÃO EDITAR/SALVAR*/}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: editButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/*BOTÃO EDITAR/SALVAR - INATIVO NO MODO EXCLUIR*/}
            <Button
              title={editMode ? "Concluir" : "Editar"}
              color="#333399"
              onPress={() =>
                handleButtonPress(editButtonScale, () => setEditMode(!editMode))
              }
              disabled={deleteMode}
            />
          </Animated.View>

          {/*LAYOUT - BOTÃO NOVO - INATIVO NO MODO EXCLUIR*/}
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: newButtonScale }] },
              deleteMode && styles.inactivemodeButtons,
            ]}
          >
            {/*BOTÃO NOVO*/}
            <Button
              title="Novo"
              color="#333399"
              onPress={() =>
                handleButtonPress(newButtonScale, () => {
                  adicionarNovoProduto();
                  setEditMode(true);
                })
              }
              disabled={deleteMode}
            />
          </Animated.View>
        </View>

          {/*LAYOUT - BOTÕES EXCLUIR*/}
        <View style={styles.downbuttonsDistance}>
          <Animated.View
            style={[
              styles.downbuttonsMargin,
              { transform: [{ scale: deleteButtonScale }] },
            ]}
          >
          {/*BOTÕES EXCLUIR*/}
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

          {/*LAYOUT - BOTÃO CANCELAR - SÓ APARECE NO MODO EXCLUSÃO*/}
          {deleteMode && (
            <Animated.View
              style={[
                styles.downbuttonsMargin,
                { transform: [{ scale: deleteButtonScale }] },
              ]}
            >
            {/*BOTÃO CANCELAR*/}
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

// <<ESTILOS - INÍCIO>>
const styles = StyleSheet.create({
  //ESTILOS PADRÃO
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
    paddingTop: 85,
    paddingBottom: 93,
    paddingHorizontal: 10,
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

  //ESTILOS ESPECÍFICOS
  SwitchProduto: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  SwitchItem: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  inputProduto: {
    width: 160,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    fontSize: 16,
  },
  spaceBetweenProduto: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  inputCusto: {
    width: 81,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    textAlign: "center",
    fontSize: 16,
  },
  inputConfeccao: {
    width: 38,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
    marginRight: 5,
  },
  arrow: {
    fontSize: 28,
    marginLeft: 5,
    color: "#333",
  },
  pointyLine: {
    borderStyle: "dotted",
    borderWidth: 1,
    borderColor: "#000",
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
  },
  inputItem: {
    width: 189,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    fontSize: 16,
    textAlign: "left",
  },
  inputPreco: {
    width: 81,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    textAlign: "center",
    fontSize: 16,
  },
  spaceBetweenItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    overflow: "hidden",
  },
  modalWindow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxHeight: "100%",
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  modalCancelButton: {
    marginTop: 0,
    color: "blue",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(50,0,255,0.2)",
  },
  inputNecessario: {
    width: 38,
    borderWidth: 1,
    borderColor: "#330066",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
    marginRight: 5,
  },
  blackLine: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
});
// << ESTILOS - FIM>>

// <<FIM DE 04_PRODUTOS>>
