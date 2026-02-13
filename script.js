const botao = document.getElementById("botaoAdicionarEntrada");
const modal = document.getElementById("modal");
const fecharModal =document.getElementById("fecharModal");
const form = document.getElementById("formEntrada");
const tabelaBody = document.querySelector("#tabelaEntradas tbody");
let grafico;




fecharModal.addEventListener("click", () => {modal.classList.remove("ativo");});





form.addEventListener("submit", (event) => {
    event.preventDefault();

    const descricao = document.getElementById("entrada").value;
    const valor = Number(document.getElementById("valor").value);
    const data = document.getElementById("data").value;

    const novaLinha = document.createElement("tr");

    novaLinha.innerHTML = `
        <td>${descricao}</td>
        <td>R$ ${valor.toFixed(2)}</td>
        <td>${data}</td>
        <td><button class="btn-excluir">Excluir</button></td>
    `;

    const botaoExcluir = novaLinha.querySelector(".btn-excluir");

    // 👉 evento de excluir (vale para entrada e gasto)
    botaoExcluir.addEventListener("click", () => {
        const confirmar = confirm("Deseja realmente excluir este item?");

        if (!confirmar) return;

        novaLinha.remove();

        if (modoAtual === "entrada") {
            atualizarTotalEntradas();
            atualizarGrafico();
        } else {
            atualizarTotalGastos();
            atualizarGrafico();
        }
    });

    // 👉 decide onde inserir
    if (modoAtual === "entrada") {
        tabelaBody.appendChild(novaLinha);
        atualizarTotalEntradas();
        atualizarGrafico();
    } else {
        tabelaBodyGastos.appendChild(novaLinha);
        atualizarTotalGastos();
        atualizarGrafico();
    }

    form.reset();
    modal.classList.remove("ativo");
    atualizarGrafico();
});

function atualizarTotalEntradas()
    {
        let total = 0;

        const linhas = tabelaBody.querySelectorAll("tr");

        linhas.forEach(linha => { 
            const textoValor = linha.children[1].textContent;
            const numero = textoValor
                .replace("R$", "")
                .replace(",",".")
                .trim();

            total += Number(numero);    
            
        });


        document.getElementById("totalEntradas").textContent = `Total de Entradas: R$ ${total.toFixed(2)}`;
    }



    const botaoGastos = document.getElementById("botaoAdicionarGastos");
    const tabelaBodyGastos = document.querySelector("#tabelaGastos tbody");
    const totalGastosEl = document.getElementById("totalGastos");

    let modoAtual = "entrada";

    botao.addEventListener("click", () => { modoAtual = "entrada";
        modal.classList.add("ativo");
    });


    botaoGastos.addEventListener("click", () => { modoAtual = "gasto"; 
        modal.classList.add("ativo");
    });




function atualizarTotalGastos() {
    let total = 0;

    tabelaBodyGastos.querySelectorAll("tr").forEach(linha => {
        const texto = linha.children[1].textContent;
        total += Number(texto.replace("R$", "").trim());
    });

    totalGastosEl.textContent =
        `Total de Gastos: R$ ${total.toFixed(2)}`;
}


function ultimosTresMeses()
{
    const hoje = new Date();
    const meses = [];

    for (let i = 2; i >= 0; i--)
    {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = `${d.getFullYear()}-${String(d.getMonth() + 1 ).padStart(2,"0")}`;
        meses.push(chave);
    }

    return meses;
}


function coletarDadosPorMes()
{
    const meses = ultimosTresMeses();
    const dados = {};
    meses.forEach(m => {dados[m] = {entradas: 0, gastos: 0};});


    tabelaBody.querySelectorAll("tr").forEach(linha => {
        const valor = Number(linha.children[1].textContent.replace("R$", "").trim());
        const data = linha.children[2].textContent;
        const mes = data.slice(0,7);

        if (dados[mes]) {dados[mes].entradas += valor;}
    });


    tabelaBodyGastos.querySelectorAll("tr").forEach(linha => {
        const valor = Number(linha.children[1].textContent.replace("R$", "").trim());
        const data = linha.children[2].textContent;
        const mes = data.slice(0,7);

        if (dados[mes]) {dados[mes].gastos += valor;}
    });

    return dados;
}


function atualizarGrafico()
{
    const dados = coletarDadosPorMes();
    const meses = Object.keys(dados);
    

     const labels = meses.map(chave  => {
        const [, mes] = chave.split("-");
        return nomeMesAbreviado(Number(mes));
    })


    const entradas = meses.map(m => dados[m].entradas);
    const gastos = meses.map(m => dados[m].gastos);

    const ctx = document.getElementById("graficoEntradasGastos");

    if (grafico)
    {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {type: "bar",
                              data: {
                                labels: labels,
                                datasets: [{label:"Entradas",data: entradas},
                                {label: "Gastos",data: gastos}]},
                                options:{responsive: true,maintainAspectRatio: false,scales:{y:{beginAtZero:true}}}
                    
                              });  
}


function nomeMesAbreviado(numeroMes) {
    const meses = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    return meses[numeroMes - 1];
}


const botaoCalcular = document.getElementById("calcularRegra");

botaoCalcular.addEventListener("click", function () {

    const salario = parseFloat(document.getElementById("salario").value);

    if (isNaN(salario) || salario <= 0) {
        alert("Digite um salário válido!");
        return;
    }

    const cinquenta = salario * 0.5;
    const trinta = salario * 0.3;
    const vinte = salario * 0.2;

    const resultadoDiv = document.getElementById("resultadoRegra");

    resultadoDiv.innerHTML = `
        <p>50% do seu salário é: R$ ${cinquenta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} Necessidades Essencias</p>
        <p>30% do seu salário é: R$ ${trinta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} Lazer e Hobbies</p>
        <p>20% do seu salário é: R$ ${vinte.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} Poupar e Investir</p>
    `;
});


//Export
document.getElementById("exportarExcel").addEventListener("click", function () {

    const entradas = [];
    const gastos = [];

    const linhasEntradas = document.querySelectorAll("#tabelaEntradas tbody tr");

    linhasEntradas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        entradas.push({
            Nome: colunas[0].innerText,
            Valor: colunas[1].innerText,
            Data: colunas[2].innerText
        });
    });

  
    const linhasGastos = document.querySelectorAll("#tabelaGastos tbody tr");

    linhasGastos.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        gastos.push({
            Nome: colunas[0].innerText,
            Valor: colunas[1].innerText,
            Data: colunas[2].innerText
        });
    });

    
    const wb = XLSX.utils.book_new();

    const wsEntradas = XLSX.utils.json_to_sheet(entradas);
    const wsGastos = XLSX.utils.json_to_sheet(gastos);

    XLSX.utils.book_append_sheet(wb, wsEntradas, "Entradas");
    XLSX.utils.book_append_sheet(wb, wsGastos, "Gastos");

    XLSX.writeFile(wb, "ControleFinanceiro.xlsx");
});


// Import
document.getElementById("botaoImportar").addEventListener("click", function () {
    document.getElementById("importarExcel").click();
});

document.getElementById("importarExcel").addEventListener("change", function (e) {

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {

        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        
        document.querySelector("#tabelaEntradas tbody").innerHTML = "";
        document.querySelector("#tabelaGastos tbody").innerHTML = "";

        
        const sheetEntradas = workbook.Sheets["Entradas"];
        const entradas = XLSX.utils.sheet_to_json(sheetEntradas);

        entradas.forEach(item => {
            adicionarLinha("tabelaEntradas", item.Nome, item.Valor, item.Data);
        });

        const sheetGastos = workbook.Sheets["Gastos"];
        const gastos = XLSX.utils.sheet_to_json(sheetGastos);

        gastos.forEach(item => {
            adicionarLinha("tabelaGastos", item.Nome, item.Valor, item.Data);
        });
        atualizarTotalEntradas();
        atualizarTotalGastos();
        atualizarGrafico();

    };

    reader.readAsArrayBuffer(file);
    
});


function adicionarLinha(tabelaId, nome, valor, data) {

    const tbody = document.querySelector(`#${tabelaId} tbody`);
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${nome}</td>
        <td>${valor}</td>
        <td>${data}</td>
        <td><button class="btn-excluir">Excluir</button></td>
    `;

    const botaoExcluir = tr.querySelector(".btn-excluir");

    botaoExcluir.addEventListener("click", () => {
        tr.remove();

        if (tabelaId === "tabelaEntradas") {
            atualizarTotalEntradas();
        } else {
            atualizarTotalGastos();
        }

        atualizarGrafico();
    });

    tbody.appendChild(tr);
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(() => console.log("Service Worker registrado"))
            .catch(err => console.log("Erro no SW:", err));
    });
}