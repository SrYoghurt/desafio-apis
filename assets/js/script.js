const input = document.querySelector('#pesoCLP');
const opciones = document.querySelector('#opciones')
const btnBuscar = document.querySelector('#btnBuscar');
const resultado = document.querySelector('.resultado');
const error = document.querySelector('.error');
const grafico = document.querySelector('#myChart');

async function database(tipoIndicador) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${tipoIndicador}`);
        const data = await res.json();
        return data.serie.slice(0, 10);
    } catch (error) {
        alert(error)
    }
}

const monedas = {
    'euro': (data, pesoCLP) => (pesoCLP / data[0].valor).toFixed(2) + ' €',
    'dolar': (data, pesoCLP) => (pesoCLP / data[0].valor).toFixed(2) + ' USD',
    'bitcoin': (data, pesoCLP) => (pesoCLP / data[0].valor).toFixed(8) + ' BTC',
};

const renderValor = async () => {
    const pesoCLP = input.value;
    const monedaElegida = opciones.value;

    if (monedaElegida === 'elige una moneda') {
        error.textContent = 'Seleccione una moneda';
        resultado.textContent = '';
    } else if (pesoCLP) {
        const data = await database(monedaElegida);
        let resultadoConversion = monedas[monedaElegida](data, pesoCLP);
        resultado.textContent = resultadoConversion
        error.textContent = '';
        renderGrafico(monedaElegida);
    } else {
        error.textContent = 'Ingrese un valor  válido';
        resultado.textContent = '';
    }
};

btnBuscar.addEventListener('click', renderValor);

async function getUltimos10Dias(tipoIndicador) {
    try {
        const data = await database(tipoIndicador);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

let myChart;
async function renderGrafico(tipoIndicador) {
    const datos = await getUltimos10Dias(tipoIndicador);
    if (!datos || datos.length === 0) return;
    
    const labels = datos.map(dato => dato.fecha).reverse();
    const valores = datos.map(dato => dato.valor).reverse();
    const ctx = grafico.getContext('2d');
    
    if(myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: tipoIndicador,
                data: valores,
                borderColor: 'rgba(136, 216, 178, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

