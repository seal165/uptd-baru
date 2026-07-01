/**
 * Controller untuk halaman PUBLIK (tidak butuh login).
 * Render: landing page, services, estimasi, profil, FAQ, track.
 */
const db = require('../config/database');
const api = require('../services/apiClient');
const logger = require('../utils/logger');

// Data statis untuk landing page
const ACCREDITED = [
    'Kadar Air', 'Analisa Saringan', 'Kuat Tekan Kubus', 'Kuat Tekan Cylinder',
    'Abrasi/Kekerasan Batuan', 'Berat Jenis Agregat Kasar', 'Berat Jenis Agregat Halus',
    'Kepadatan Laboratorium', 'Extraction', 'Kuat Tarik Besi',
    'Uji Kuat Tekan Paving Block', 'Kuat Tekan Inti Beton Hasil Pemboran',
    'Kuat Lentur Beton', 'Sand Cone Tanah'
];

const NON_ACCREDITED = [
    'Penelitian Sondir/Bor Tangan', 'Core Drill Aspal Beton', 'CBR Lapangan',
    'Dynamic Cone Penetrometer (DCP)', 'Hammer Test', 'Core Drill Beton', 'Berat Isi',
    'CBR Laboratorium', 'Atterberg', 'Pemadatan Standart dan Modified',
    'Mix Design Beton', 'Kuat Tekan Mortar', 'Mix Design Agregat',
    'Kuat Lentur Besi', 'Mix Design Hotmix', 'Marshall Test'
];

const PRICES = [
    { item: 'Sondir (Max 20m)', price: '800.000', unit: 'Per Titik' },
    { item: 'Sand Cone', price: '100.000', unit: 'Per Titik' },
    { item: 'CBR Lapangan', price: '250.000', unit: 'Per Titik' },
    { item: 'Kuat Tekan Beton', price: '60.000', unit: 'Per Sampel' }
];

const BEST_SELLER = [
    { name: 'Kuat Tekan Beton', orders: 245, icon: '🏗️' },
    { name: 'Uji Sondir', orders: 189, icon: '🔨' },
    { name: 'Marshall Test', orders: 156, icon: '🛣️' },
    { name: 'Sand Cone', orders: 134, icon: '⛰️' },
    { name: 'Uji Tarik Besi', orders: 112, icon: '⚙️' }
];

exports.landing = (req, res) => {
    res.render('index', {
        title: 'Beranda - UPTD Pengujian Bahan Kontruksi Bangunan',
        active: 'home',
        params: { accredited: ACCREDITED, nonAccredited: NON_ACCREDITED },
        prices: PRICES,
        bestSeller: BEST_SELLER,
        user: req.session.user || null
    });
};

exports.profile = (req, res) => {
    res.render('profile', {
        title: 'Profil & Lokasi',
        active: 'profile',
        user: req.session.user || null
    });
};

exports.faq = (req, res) => {
    res.render('faq', {
        title: 'FAQ - UPTD Laboratorium',
        active: 'faq',
        user: req.session.user || null
    });
};

exports.services = async (req, res) => {
    try {
        const response = await api.public.getServices();
        const services = response.data?.success ? response.data.data || [] : [];

        res.render('services', {
            title: 'Pelayanan & Tarif - UPTD Lab',
            active: 'services',
            services,
            user: req.session.user || null
        });
    } catch (err) {
        logger.error('Error loading services: ' + err.message);
        res.render('services', {
            title: 'Pelayanan & Tarif - UPTD Lab',
            active: 'services',
            services: [],
            user: req.session.user || null
        });
    }
};

exports.estimasi = async (req, res) => {
    try {
        // Estimasi page query DB langsung supaya bisa dapat detail kolom (min_sample, satuan)
        const [services] = await db.query(`
            SELECT 
                s.id, s.service_name, s.min_sample, s.satuan,
                CONCAT(s.min_sample, ' ', s.satuan) AS sample_text,
                s.duration_days AS duration, s.price, s.method, s.kan, s.test_type_id,
                tc.id AS category_id, tc.category_name, tt.type_name
            FROM services s
            JOIN test_categories tc ON s.category_id = tc.id
            JOIN test_types tt ON s.test_type_id = tt.id
            ORDER BY tt.type_name, tc.category_name, s.service_name
        `);

        const servicesByType = {};
        services.forEach((s) => {
            if (!servicesByType[s.type_name]) {
                servicesByType[s.type_name] = { typeName: s.type_name, categories: {} };
            }
            if (!servicesByType[s.type_name].categories[s.category_name]) {
                servicesByType[s.type_name].categories[s.category_name] = {
                    categoryName: s.category_name,
                    items: []
                };
            }
            servicesByType[s.type_name].categories[s.category_name].items.push({
                id: s.id,
                service_name: s.service_name,
                name: s.service_name,
                sample_value: s.min_sample || 1,
                sample_unit: s.satuan || 'sample',
                sample_text: s.sample_text || `${s.min_sample || 1} ${s.satuan || 'sample'}`,
                duration: s.duration || '7',
                price: parseFloat(s.price) || 0,
                method: s.method || '-',
                kan: s.kan,
                test_type_id: s.test_type_id,
                unit: s.satuan || 'sample'
            });
        });

        const formattedServices = Object.values(servicesByType).map((type) => ({
            typeName: type.typeName,
            categories: Object.values(type.categories)
        }));

        res.render('estimasi', {
            services: formattedServices,
            title: 'Estimasi Biaya Pengujian - UPTD Lab',
            active: 'estimasi',
            user: req.session.user || null,
            currentUrl: req.originalUrl
        });
    } catch (err) {
        logger.error('Error loading estimasi: ' + err.message);
        res.render('estimasi', {
            services: [],
            title: 'Estimasi Biaya Pengujian - UPTD Lab',
            active: 'estimasi',
            user: req.session.user || null,
            currentUrl: req.originalUrl
        });
    }
};

exports.maintenance = (req, res) => {
    res.render('maintenance', {
        title: 'Mode Pemeliharaan - UPTD Lab',
        layout: false
    });
};

exports.trackPage = (req, res) => {
    res.render('public/track', {
        title: 'Lacak Pengajuan - UPTD Laboratorium',
        no_urut: req.params.no_urut
    });
};

exports.kuisionerPublic = async (req, res) => {
    try {
        const submissionId = req.params.submissionId;
        const token = req.session?.token;

        let alreadyFilled = false;
        let reportAvailable = false;
        let questions = [];

        // Cek apakah sudah pernah ngisi
        try {
            const check = await api.kuisioner.check(token, submissionId);
            alreadyFilled = check.data?.data?.filled || false;
        } catch (e) { /* ignore */ }

        // Cek apakah laporan tersedia
        if (token) {
            try {
                const sub = await api.submission.detail(token, submissionId);
                if (sub.data?.success) {
                    reportAvailable = !!sub.data.data.report?.file_laporan;
                }
            } catch (e) { /* ignore */ }
        }

        // Ambil daftar pertanyaan
        try {
            const q = await api.kuisioner.publicQuestions();
            questions = q.data?.success ? q.data.data || [] : [];
        } catch (e) { /* ignore */ }

        res.render('kuisioner', {
            title: 'Kuisioner Kepuasan - UPTD Lab',
            layout: false,
            submissionId,
            alreadyFilled,
            reportAvailable,
            questions,
            user: req.session?.user || null,
            error: null
        });
    } catch (err) {
        logger.error('Error loading kuisioner: ' + err.message);
        res.status(500).send('Terjadi kesalahan');
    }
};
