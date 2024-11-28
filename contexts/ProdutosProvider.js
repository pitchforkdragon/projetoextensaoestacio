// <<INÍCIO DE PRODUTOSPROVIDER.JS>>

// <<IMPORTAÇÃO DE BIBLIOTECAS - INÍCIO>>
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EstoqueContext } from "./EstoqueProvider";
// <<IMPORTAÇÃO DE BIBLIOTECAS - FIM>>

// <<DEFINIÇAO DE COMPONENTES - INÍCIO>>
// VARIÁVEIS PRIMÁRIAS
export const ProdutosContext = createContext();
export const ProdutosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const {
    estoque,
    adicionarItem,
    atualizarItemEstoque,
    excluirItensSelecionados,
  } = useContext(EstoqueContext);

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

  // SOLICITAÇÃO DE LOADING DOS DADOS DOS PRODUTOS
  useEffect(() => {
    const carregarProdutos = async () => {
      const produtosSalvos = await loadDataFromStorage("produtos", []);
      setProdutos(produtosSalvos);
    };
    carregarProdutos();
  }, []);

  // SALVA OS PRODUTOS EM TEMPO REAL
  useEffect(() => {
    saveDataToStorage("produtos", produtos);
  }, [produtos]);

  // ADICIONAR PRODUTO
  const adicionarProduto = (novoProduto) => {
    const produtoComId = {
      id: novoProduto.id || Date.now(),
      nomeProduto: novoProduto.nomeProduto || "",
      preco: novoProduto.preco || "",
      quantidade: novoProduto.quantidade || "",
      itens: novoProduto.itens || [],
    };

    setProdutos((prevProdutos) => {
      const produtosAtualizados = [...prevProdutos, produtoComId];

      // ENVIAR PRODUTO PARA O ESTOQUE
      adicionarItem({
        id: produtoComId.id,
        produto: produtoComId.nomeProduto,
        quantidade: 0,
      });

      return produtosAtualizados;
    });
  };

  // ADICIONAR NOVO PRODUTO
  const adicionarNovoProduto = () => {
    const novoProduto = {
      id: Date.now(),
      nomeProduto: "",
      preco: "",
      quantidade: "",
      itens: [],
    };
    adicionarProduto(novoProduto);
  };

  //EXCLUIR PRODUTOS E SALVAR
  const excluirProdutos = (idsParaExcluir) => {
    setProdutos((prevProdutos) => {
      const produtosAtualizados = prevProdutos.filter(
        (produto) => !idsParaExcluir.includes(produto.id)
      );
      // REPLICA A EXCLUSÃO NOS PRODUTOS EM ESTOQUEPROVIDER.JS
      excluirItensSelecionados(idsParaExcluir);
      return produtosAtualizados;
    });
  };

  //ATUALIZAÇÃO AS INFORMAÇOES DE UM PRODUTO
  const atualizarProduto = (produtoAtualizado) => {
    setProdutos((prevProdutos) => {
      const produtosAtualizados = prevProdutos.map((produto) =>
        produto.id === produtoAtualizado.id ? produtoAtualizado : produto
      );
      //REPLICA A ATUALIZAÇAO NOS PRODUTOS EM ESTOQUEPROVIDER.JS
      const estoqueItemExistente = estoque.find(
        (item) => item.id === produtoAtualizado.id
      );
      if (estoqueItemExistente) {
        atualizarItemEstoque({
          id: produtoAtualizado.id,
          produto: produtoAtualizado.nomeProduto,
          quantidade: estoqueItemExistente.quantidade,
        });
      } else {
        adicionarItem({
          id: produtoAtualizado.id,
          produto: produtoAtualizado.nomeProduto,
          quantidade: 0,
        });
      }
      return produtosAtualizados;
    });
  };

       //COMANDOS PARA CONTROLAR A ADIÇÃO, ATUALIZAÇÃO E EXCLUSÃO DE PRODUTOS
  return (
    <ProdutosContext.Provider
      value={{
        produtos,
        adicionarProduto,
        adicionarNovoProduto,
        excluirProdutos,
        atualizarProduto,
      }}
    >
          {/*DISPONIBILIDAÇÃO DO CONTEXTO PARA JANELAS PERTINENTES*/}
      {children}
    </ProdutosContext.Provider>
  );
};
// <<DEFINIÇAO DE COMPONENTES - FIM>>
// <<FIM DE PRODUTOSPROVIDER.JS>>