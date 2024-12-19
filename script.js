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

// Initialize Chart.js
let ctx = document.getElementById('probabilityChart').getContext('2d');
let probabilityChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Program Uptake'],
        datasets: [{
            label: 'Probability',
            data: [0],
            backgroundColor: ['rgba(39, 174, 96, 0.6)'],
            borderColor: ['rgba(39, 174, 96, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                ticks: {
                    callback: function(value) {
                        return (value * 100) + '%';
                    },
                    stepSize: 0.1
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
                text: 'Predicted Probability of Program Uptake'
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
    const type_comm = parseFloat(document.getElementById('type_comm').value);
    const type_psych = parseFloat(document.getElementById('type_psych').value);
    const type_vr = parseFloat(document.getElementById('type_vr').value);

    // Validate that both durations are not selected as 'Yes'
    if (dur_2hrs === 1 && dur_4hrs === 1) {
        alert("Please select only one duration: either 2 Hours or 4 Hours.");
        return;
    }

    // Validate that both frequencies are not selected as 'Yes'
    if (freq_monthly === 1 && freq_weekly === 1) {
        alert("Please select only one frequency: either Monthly or Weekly.");
        return;
    }

    // Validate that both accessibility attributes are not selected as 'Yes'
    if (dist_local === 1 && dist_signif === 1) {
        alert("Please select only one accessibility option: either Local Area Accessibility or Low Accessibility.");
        return;
    }

    // Calculate U_alt1
    let U_alt1 = coefficients.ASC_alt1 +
                coefficients.type_comm * type_comm +
                coefficients.type_psych * type_psych +
                coefficients.type_vr * type_vr +
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

    // Update the chart color based on probability
    let barColor;
    let borderColor;
    if (P_final < 0.3) {
        barColor = 'rgba(231, 76, 60, 0.6)'; // Red
        borderColor = 'rgba(231, 76, 60, 1)';
    } else if (P_final >= 0.3 && P_final < 0.7) {
        barColor = 'rgba(241, 196, 15, 0.6)'; // Yellow
        borderColor = 'rgba(241, 196, 15, 1)';
    } else {
        barColor = 'rgba(39, 174, 96, 0.6)'; // Green
        borderColor = 'rgba(39, 174, 96, 1)';
    }
    probabilityChart.data.datasets[0].backgroundColor[0] = barColor;
    probabilityChart.data.datasets[0].borderColor[0] = borderColor;
    probabilityChart.update();

    // Update Notes Section
    const notesDiv = document.getElementById('notes');
    notesDiv.innerHTML = generateNotes(P_final);

    // Update Program Package Display
    const packageList = document.getElementById('packageList');
    packageList.innerHTML = generateProgramPackage();

    // Show or hide download button based on package selection
    const downloadBtn = document.getElementById('downloadBtn');
    if (packageList.children.length > 0) {
        downloadBtn.style.display = 'inline-block';
    } else {
        downloadBtn.style.display = 'none';
    }

    // Ensure the chart is visible
    document.querySelector('.chart-container').style.display = 'block';
}

// Function to generate brief notes based on probability and preference estimates
function generateNotes(probability) {
    let notes = '';
    if (probability < 0.3) {
        notes = `
            <p><strong>Recommendation:</strong> Low uptake predicted. Enhancing community engagement and accessibility can improve participation.</p>
        `;
    } else if (probability >= 0.3 && probability < 0.7) {
        notes = `
            <p><strong>Recommendation:</strong> Moderate uptake predicted. Boosting psychological counselling and introducing virtual reality can enhance participation.</p>
        `;
    } else {
        notes = `
            <p><strong>Excellent:</strong> High uptake predicted. Continue supporting diverse programs and maintaining strong community engagement.</p>
        `;
    }
    return notes;
}

// Function to generate program package list with user-friendly labels
function generateProgramPackage() {
    const packageList = [];
    const form = document.getElementById('decisionForm');
    const selects = form.getElementsByTagName('select');
    for (let select of selects) {
        if (select.value === "1") {
            let label = select.previousElementSibling.innerText;
            label = label.replace('(1)', '').replace('(0)', '').trim();
            const value = select.options[select.selectedIndex].innerText;
            packageList.push(`${label}: ${value}`);
        }
    }
    // Generate HTML list items
    let listItems = '';
    packageList.forEach(item => {
        listItems += `<li>${item}</li>`;
    });
    return listItems;
}

// Function to download program package as a text file
function downloadPackage() {
    const packageList = document.getElementById('packageList').innerText;
    if (!packageList.trim()) {
        alert("No program package selected to download.");
        return;
    }
    const blob = new Blob([packageList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Program_Package.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Add event listeners to Duration fields to enforce selection constraints
document.getElementById('dur_2hrs').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('dur_4hrs').value = "0";
        document.getElementById('dur_4hrs').disabled = true;
    } else {
        document.getElementById('dur_4hrs').disabled = false;
    }
});

document.getElementById('dur_4hrs').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('dur_2hrs').value = "0";
        document.getElementById('dur_2hrs').disabled = true;
    } else {
        document.getElementById('dur_2hrs').disabled = false;
    }
});

// Add event listeners to Frequency fields to enforce selection constraints
document.getElementById('freq_monthly').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('freq_weekly').value = "0";
        document.getElementById('freq_weekly').disabled = true;
    } else {
        document.getElementById('freq_weekly').disabled = false;
    }
});

document.getElementById('freq_weekly').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('freq_monthly').value = "0";
        document.getElementById('freq_monthly').disabled = true;
    } else {
        document.getElementById('freq_monthly').disabled = false;
    }
});

// Add event listeners to Accessibility fields to enforce mutual exclusivity
document.getElementById('dist_local').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('dist_signif').value = "0";
        document.getElementById('dist_signif').disabled = true;
    } else {
        document.getElementById('dist_signif').disabled = false;
    }
});

document.getElementById('dist_signif').addEventListener('change', function() {
    if (this.value === "1") {
        document.getElementById('dist_local').value = "0";
        document.getElementById('dist_local').disabled = true;
    } else {
        document.getElementById('dist_local').disabled = false;
    }
});
