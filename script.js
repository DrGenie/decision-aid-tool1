/* script.js */

// Model Coefficients
const coefficients = {
    ASC_alt1: 0.1422162,
    ASC_optout: 0.879628,
    type_comm: 0.5696486,
    type_psych: -0.2459649,
    type_vr: -0.6620007,
    mode_virtual: -0.1003311,
    mode_hybrid: -0.4221009,
    freq_weekly: 0.6244582,
    freq_monthly: 0.4848079,
    dur_2hrs: 0.2763754,
    dur_4hrs: 0.2763252,
    dist_local: 0.3362482,
    dist_signif: -0.3511829,
    cost_cont: -0.0176963
};

// Initialize Chart.js (Optional)
let ctx = document.getElementById('probabilityChart').getContext('2d');
let probabilityChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Predicted Probability'],
        datasets: [{
            label: 'P_alt1',
            data: [0],
            backgroundColor: ['rgba(76, 175, 80, 0.6)'],
            borderColor: ['rgba(76, 175, 80, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                ticks: {
                    callback: function(value) {
                        return (value * 100) + '%';
                    }
                },
                title: {
                    display: true,
                    text: 'Probability'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Predicted Probability of Choosing Alternative 1'
            }
        }
    }
});

// Function to calculate predicted probability and update the chart
function calculateProbability() {
    // Get values from the form
    const cost_cont = parseFloat(document.getElementById('cost_cont').value);
    const dist_signif = parseFloat(document.getElementById('dist_signif').value);
    const dist_local = parseFloat(document.getElementById('dist_local').value);
    const freq_monthly = parseFloat(document.getElementById('freq_monthly').value);
    const freq_weekly = parseFloat(document.getElementById('freq_weekly').value);
    const mode_virtual = parseFloat(document.getElementById('mode_virtual').value);
    const mode_hybrid = parseFloat(document.getElementById('mode_hybrid').value);
    const dur_2hrs = parseFloat(document.getElementById('dur_2hrs').value);
    const dur_4hrs = parseFloat(document.getElementById('dur_4hrs').value);

    // Calculate U_alt1
    let U_alt1 = coefficients.ASC_alt1 +
                coefficients.type_comm * 0 + // Assuming 'type_comm' not varied in scenarios
                coefficients.type_psych * 0 + // Assuming 'type_psych' not varied in scenarios
                coefficients.type_vr * 0 + // Assuming 'type_vr' not varied in scenarios
                coefficients.mode_virtual * mode_virtual +
                coefficients.mode_hybrid * mode_hybrid +
                coefficients.freq_weekly * freq_weekly +
                coefficients.freq_monthly * freq_monthly +
                coefficients.dur_2hrs * dur_2hrs +
                coefficients.dur_4hrs * dur_4hrs +
                coefficients.dist_local * dist_local +
                coefficients.dist_signif * dist_signif +
                coefficients.cost_cont * cost_cont;

    // Calculate U_optout
    const U_optout = coefficients.ASC_optout;

    // Calculate P_alt1 using the logistic function
    const exp_U_alt1 = Math.exp(U_alt1);
    const exp_U_optout = Math.exp(U_optout);
    const P_alt1 = exp_U_alt1 / (exp_U_alt1 + exp_U_optout);

    // Ensure P_alt1 is between 0 and 1
    const P_final = Math.min(Math.max(P_alt1, 0), 1);

    // Display the result with percentage formatting
    document.getElementById('probability').innerText = (P_final * 100).toFixed(2) + '%';

    // Update the chart (Optional)
    probabilityChart.data.datasets[0].data[0] = P_final;
    probabilityChart.update();
}
