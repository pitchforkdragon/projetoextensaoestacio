// <<INÍCIO DE INVENTARIOPROVIDER.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
//VARIÁVEIS PRIMÁRIAS
export const InventarioContext = createContext();
export const InventarioProvider = ({ children }) => {
  const [inventario, setInventario] = useState([]);

  // PROTOCOLO DE SAVE
  const saveDataToStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Erro ao salvar os dados no AsyncStorage:", error);
    }
  };

// PROTOCOLO DE LOAD
  const loadDataFromStorage = async (key, defaultValue) => {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Erro ao carregar os dados do AsyncStorage:", error);
      return defaultValue;
    }
  };

  //CARREGA OS ITENS DO INVENTÁRIO PARA O PROVIDER
  useEffect(() => {
    const carregarInventario = async () => {
      const inventarioSalvo = await loadDataFromStorage("inventario", []);
      setInventario(inventarioSalvo);
    };
    carregarInventario();
  }, []);

  //SALVA OS ITENS DO INVENTÁRIO EM TEMPO REAL
  useEffect(() => {
    saveDataToStorage("inventario", inventario);
  }, [inventario]);

  //ATUALIZAR ITEM DO INVENTÁRIO
  const atualizarItemInventario = (itemAtualizado) => {
    setInventario((prevInventario) =>
      prevInventario.map((item) =>
        item.id === itemAtualizado.id ? itemAtualizado : item
      )
    );
  };

  //ADICIONAR ITEM AO INVENTÁRIO
  const adicionarItem = (novoItem) => {
    setInventario((prevInventario) => [...prevInventario, novoItem]);
  };

  //EXCLUIR ITENS DO INVENTÁRIO
  const excluirItensSelecionados = (idsParaExcluir) => {
    setInventario((prevInventario) =>
      prevInventario.filter((item) => !idsParaExcluir.includes(item.id))
    );
  };
  // <<DEFINIÇAO DE COMPONENTES - FIM>>

  // <<CONFIGURAÇÃO DO PROVIDER - INÍCIO>>
  return (
       //COMANDOS PARA CONTROLAR A ADIÇÃO, ATUALIZAÇÃO E EXCLUSÃO DE ITENS DO ESTOUQUE EM RELAÇÃO AOS PRODUTOS
    <InventarioContext.Provider
      value={{
        inventario,
        atualizarItemInventario,
        adicionarItem,
        excluirItensSelecionados,
      }}
    >
          {/*DISPONIBILIDAÇÃO DO CONTEXTO PARA JANELAS PERTINENTES*/}
      {children}
    </InventarioContext.Provider>
  );
};
// <<CONFIGURAÇÃO DO PROVIDER - FIM>>
// <<FIM DE INVENTARIOPROVIDER.JS>>