

const app = {
    
    bookingData: {
        date: null,
        pax: 2,
        time: null,
        name: '',
        phone: '',
        email: '',
        notes: ''
    },

    availableSlots: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"],

    init: () => {
  
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-input').min = today;
        document.getElementById('date-input').value = today;
        
        app.loadAdminData(); 
    },


    goToStep: (stepNumber) => {

        if (stepNumber === 2 && !document.getElementById('date-input').value) {
            alert("Lütfen bir tarih seçiniz.");
            return;
        }

 
        if (stepNumber === 2) {
            app.bookingData.date = document.getElementById('date-input').value;
            app.bookingData.pax = document.getElementById('pax-input').value;
            app.renderTimeSlots();
        }

        if (stepNumber === 3) {
            if (!app.bookingData.time) {
                alert("Lütfen bir saat seçiniz.");
                return;
            }
       
            document.getElementById('summary-text').innerText = 
                `${app.bookingData.date} tarihinde, saat ${app.bookingData.time} için ${app.bookingData.pax} kişilik masa.`;
        }

       
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
    },


    renderTimeSlots: () => {
        const container = document.getElementById('time-slots');
        container.innerHTML = '';
        

        const existing = app.getReservations();
        const reservedTimes = existing
            .filter(r => r.date === app.bookingData.date && r.status !== 'İptal')
            .map(r => r.time);

        app.availableSlots.forEach(time => {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.innerText = time;

            
            if (reservedTimes.includes(time)) {
                div.classList.add('disabled');
            } else {
                div.onclick = () => {
                    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                    div.classList.add('selected');
                    app.bookingData.time = time;
                    setTimeout(() => app.goToStep(3), 300);
                };
            }
            container.appendChild(div);
        });
    },

    
    completeBooking: () => {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        
        if (!name || !phone) {
            alert("Lütfen isim ve telefon bilgilerini giriniz.");
            return;
        }

        app.bookingData.name = name;
        app.bookingData.phone = phone;
        app.bookingData.email = document.getElementById('email').value;
        app.bookingData.notes = document.getElementById('notes').value;
        app.bookingData.status = 'Onay Bekliyor';
        app.bookingData.id = Date.now(); 

       
        const reservations = app.getReservations();
        reservations.push(app.bookingData);
        localStorage.setItem('reservations', JSON.stringify(reservations));

       
        app.loadAdminData();

       
        app.goToStep('success');
    },

    

    getReservations: () => {
        const data = localStorage.getItem('reservations');
        return data ? JSON.parse(data) : [];
    },

    toggleAdmin: () => {
        const panel = document.getElementById('admin-panel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            app.loadAdminData();
        }
    },

    loadAdminData: () => {
        const list = app.getReservations();
        const tbody = document.getElementById('admin-tbody');
        tbody.innerHTML = '';

       
        list.sort((a, b) => new Date(b.date) - new Date(a.date));

        list.forEach(res => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${res.date}</td>
                <td>${res.time}</td>
                <td>${res.name}<br><small>${res.phone}</small></td>
                <td>${res.pax}</td>
                <td style="color: ${res.status === 'Onaylandı' ? 'green' : res.status === 'İptal' ? 'red' : 'orange'}">
                    ${res.status}
                </td>
                <td>
                    ${res.status !== 'İptal' ? `<button onclick="app.updateStatus(${res.id}, 'Onaylandı')">✅</button>` : ''}
                    ${res.status !== 'İptal' ? `<button onclick="app.updateStatus(${res.id}, 'İptal')">❌</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    updateStatus: (id, newStatus) => {
        const reservations = app.getReservations();
        const index = reservations.findIndex(r => r.id === id);
        if (index > -1) {
            reservations[index].status = newStatus;
            localStorage.setItem('reservations', JSON.stringify(reservations));
            app.loadAdminData();
         
        }
    }
};


document.addEventListener('DOMContentLoaded', app.init);