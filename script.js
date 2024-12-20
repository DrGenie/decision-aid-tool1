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

// Initialize Chart.js with Doughnut Chart for Uptake Probability
let ctx = document.getElementById('probabilityChart').getContext('2d');
let probabilityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Uptake Probability', 'Remaining'],
        datasets: [{
            data: [0, 1],
            backgroundColor: ['rgba(39, 174, 96, 0.6)', 'rgba(236, 240, 241, 0.3)'], // Green and Light Gray
            borderColor: ['rgba(39, 174, 96, 1)', 'rgba(236, 240, 241, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 14
                    },
                    color: '#34495e'
                }
            },
            title: {
                display: true,
                text: 'Predicted Probability of Program Uptake',
                font: {
                    size: 18
                },
                color: '#2c3e50'
            }
        }
    }
});

// Initialize Chart.js with Bar Chart for WTP
let wtpCtx = document.getElementById('wtpChart').getContext('2d');
let wtpChart = new Chart(wtpCtx, {
    type: 'bar',
    data: {
        labels: [], // Program Features
        datasets: [{
            label: 'WTP (AUD)',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'WTP (AUD)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Willingness To Pay (WTP) for Program Features',
                font: {
                    size: 18
                },
                color: '#2c3e50'
            }
        }
    }
});

// Function to calculate predicted probability and update the charts and tables
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

    // Update the Uptake Probability chart
    probabilityChart.data.datasets[0].data = [P_final, 1 - P_final];

    // Update the Uptake Probability chart color based on probability
    if (P_final < 0.3) {
        probabilityChart.data.datasets[0].backgroundColor = ['rgba(231, 76, 60, 0.6)', 'rgba(236, 240, 241, 0.3)']; // Red and Light Gray
        probabilityChart.data.datasets[0].borderColor = ['rgba(231, 76, 60, 1)', 'rgba(236, 240, 241, 1)'];
    } else if (P_final >= 0.3 && P_final < 0.7) {
        probabilityChart.data.datasets[0].backgroundColor = ['rgba(241, 196, 15, 0.6)', 'rgba(236, 240, 241, 0.3)']; // Yellow and Light Gray
        probabilityChart.data.datasets[0].borderColor = ['rgba(241, 196, 15, 1)', 'rgba(236, 240, 241, 1)'];
    } else {
        probabilityChart.data.datasets[0].backgroundColor = ['rgba(39, 174, 96, 0.6)', 'rgba(236, 240, 241, 0.3)']; // Green and Light Gray
        probabilityChart.data.datasets[0].borderColor = ['rgba(39, 174, 96, 1)', 'rgba(236, 240, 241, 1)'];
    }

    // Update the Uptake Probability chart
    probabilityChart.update();

    // Update Notes Section
    const notesDiv = document.getElementById('notes');
    notesDiv.innerHTML = generateNotes(P_final);

    // Update Program Package Display
    const packageList = document.getElementById('packageList');
    packageList.innerHTML = generateProgramPackage();

    // Update WTP Table and Chart
    const wtpTableBody = document.querySelector('#wtpTable tbody');
    const wtpData = calculateWTP();
    wtpTableBody.innerHTML = generateWTPTable(wtpData);
    updateWTPChart(wtpData);

    // Show or hide download buttons based on package selection
    const downloadPackageBtn = document.getElementById('downloadPackageBtn');
    const downloadChartBtn = document.getElementById('downloadChartBtn');
    const downloadWtpBtn = document.getElementById('downloadWtpBtn');
    const downloadNotesBtn = document.getElementById('downloadNotesBtn');
    if (packageList.children.length > 0) {
        downloadPackageBtn.style.display = 'inline-block';
        downloadChartBtn.style.display = 'inline-block';
        downloadWtpBtn.style.display = 'inline-block';
        downloadNotesBtn.style.display = 'inline-block';
    } else {
        downloadPackageBtn.style.display = 'none';
        downloadChartBtn.style.display = 'none';
        downloadWtpBtn.style.display = 'none';
        downloadNotesBtn.style.display = 'none';
    }

    // Ensure the charts are visible
    document.querySelector('.chart-container').style.display = 'block';
    document.getElementById('wtpSection').style.display = 'block';
}

// Function to generate brief notes based on probability and preference estimates
function generateNotes(probability) {
    // Fetch WTP values from the table
    const wtpRows = document.querySelectorAll('#wtpTable tbody tr');
    let wtpValues = {};
    wtpRows.forEach(row => {
        const feature = row.cells[0].innerText;
        const wtp = parseFloat(row.cells[1].innerText);
        wtpValues[feature] = wtp;
    });

    // Extract specific WTP values
    const commWTP = wtpValues["Community Engagement"] || 0;
    const psychWTP = wtpValues["Psychological Counselling"] || 0;
    const vrWTP = wtpValues["Virtual Reality"] || 0;

    // Construct the notes with actual WTP values
    let notes = `
        <p><strong>Willingness-to-Pay (WTP) Analysis:</strong></p>
        <p>Willingness-to-Pay (WTP) is calculated as the negative ratio of the attribute coefficient to the cost coefficient. It represents the monetary value participants assign to changes in support program features.</p>
        <p>For instance, the WTP for Community Engagement compared to the baseline (peer-support) was approximately AUD ${commWTP.toFixed(2)}, which means that participants on average are willing to pay AUD ${commWTP.toFixed(2)} more per session compared to the baseline peer support programs. This indicates a strong preference for programs that facilitate structured social interactions within the community, suggesting the importance of strengthening community ties and providing diverse social opportunities for older adults.</p>
        <p>In contrast, Psychological Counselling and Virtual Reality (VR) programs elicited negative WTP estimates of AUD ${psychWTP.toFixed(2)} and AUD ${vrWTP.toFixed(2)}, respectively. These negative values suggest that participants perceive Psychological Counselling as less desirable than peer support, potentially due to stigma or perceived effectiveness. The significantly negative valuation of VR programs may reflect discomfort with technology, perceived lack of personal interaction, or skepticism about the efficacy of virtual interventions in mitigating loneliness.</p>
    `;
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
            label = label.replace(':', '').trim();
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

// Function to calculate WTP for each non-cost attribute
function calculateWTP() {
    const wtp = {};
    const costCoefficient = Math.abs(coefficients.cost_cont);

    // List of non-cost attributes
    const attributes = {
        "Community Engagement": coefficients.type_comm,
        "Psychological Counselling": coefficients.type_psych,
        "Virtual Reality": coefficients.type_vr,
        "Virtual Mode": coefficients.mode_virtual,
        "Hybrid Mode": coefficients.mode_hybrid,
        "Weekly Frequency": coefficients.freq_weekly,
        "Monthly Frequency": coefficients.freq_monthly,
        "Duration 2 Hours": coefficients.dur_2hrs,
        "Duration 4 Hours": coefficients.dur_4hrs,
        "Local Area Accessibility": coefficients.dist_local,
        "Low Accessibility": coefficients.dist_signif
    };

    for (let feature in attributes) {
        const coef = attributes[feature];
        // Only calculate WTP for attributes with non-zero coefficients
        if (coef !== 0) {
            wtp[feature] = coef / costCoefficient;
        }
    }

    return wtp;
}

// Function to generate WTP table rows
function generateWTPTable(wtpData) {
    let tableRows = '';
    for (let feature in wtpData) {
        tableRows += `
            <tr>
                <td>${feature}</td>
                <td>${wtpData[feature].toFixed(2)}</td>
            </tr>
        `;
    }
    return tableRows;
}

// Function to update the WTP chart
function updateWTPChart(wtpData) {
    // Extract features and their WTP values
    const features = Object.keys(wtpData);
    const wtpValues = Object.values(wtpData);
    
    // Determine bar colors based on positive or negative WTP
    const barColors = wtpValues.map(value => value >= 0 ? 'rgba(46, 204, 113, 0.6)' : 'rgba(231, 76, 60, 0.6)');
    const borderColors = wtpValues.map(value => value >= 0 ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)');

    // Update WTP Chart data
    wtpChart.data.labels = features;
    wtpChart.data.datasets[0].data = wtpValues;
    wtpChart.data.datasets[0].backgroundColor = barColors;
    wtpChart.data.datasets[0].borderColor = borderColors;
    wtpChart.update();
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

// Function to download the Uptake Probability chart as an image
function downloadChart() {
    const canvas = document.getElementById('probabilityChart');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'Uptake_Probability_Chart.png';
    link.click();
}

// Function to download WTP table as a CSV file
function downloadWTP() {
    const table = document.getElementById('wtpTable');
    let csvContent = "data:text/csv;charset=utf-8,Program Feature,WTP (AUD)\n";
    for (let row of table.rows) {
        const rowData = [];
        for (let cell of row.cells) {
            // Escape double quotes in cell data
            let cellText = cell.innerText.replace(/"/g, '""');
            // Wrap cell data in double quotes if it contains commas
            if (cellText.includes(',')) {
                cellText = `"${cellText}"`;
            }
            rowData.push(cellText);
        }
        csvContent += rowData.join(",") + "\n";
    }
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = 'WTP_Table.csv';
    a.click();
}

// Function to download WTP notes as a text file
function downloadNotes() {
    // Fetch WTP values from the table
    const wtpRows = document.querySelectorAll('#wtpTable tbody tr');
    let wtpValues = {};
    wtpRows.forEach(row => {
        const feature = row.cells[0].innerText;
        const wtp = parseFloat(row.cells[1].innerText);
        wtpValues[feature] = wtp;
    });

    // Extract specific WTP values
    const commWTP = wtpValues["Community Engagement"] || 0;
    const psychWTP = wtpValues["Psychological Counselling"] || 0;
    const vrWTP = wtpValues["Virtual Reality"] || 0;

    // Construct the notes with actual WTP values
    let notes = `
Willingness-to-Pay (WTP) Analysis:

Willingness-to-Pay (WTP) is calculated as the negative ratio of the attribute coefficient to the cost coefficient. It represents the monetary value participants assign to changes in support program features.

For instance, the WTP for Community Engagement compared to the baseline (peer-support) was approximately AUD ${commWTP.toFixed(2)}, which means that participants on average are willing to pay AUD ${commWTP.toFixed(2)} more per session compared to the baseline peer support programs. This indicates a strong preference for programs that facilitate structured social interactions within the community, suggesting the importance of strengthening community ties and providing diverse social opportunities for older adults.

In contrast, Psychological Counselling and Virtual Reality (VR) programs elicited negative WTP estimates of AUD ${psychWTP.toFixed(2)} and AUD ${vrWTP.toFixed(2)}, respectively. These negative values suggest that participants perceive Psychological Counselling as less desirable than peer support, potentially due to stigma or perceived effectiveness. The significantly negative valuation of VR programs may reflect discomfort with technology, perceived lack of personal interaction, or skepticism about the efficacy of virtual interventions in mitigating loneliness.
    `;

    // Create a blob from the notes
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WTP_Notes.txt';
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
// Add to script.js
document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const feedback = document.getElementById('feedback').value.trim();
    if (feedback) {
        // For demonstration, we'll just alert the feedback. 
        // In a real application, you'd send this to a server.
        alert("Thank you for your feedback!");
        document.getElementById('feedbackForm').reset();
    } else {
        alert("Please enter your feedback before submitting.");
    }
});
