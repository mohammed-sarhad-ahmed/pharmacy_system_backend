const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required']
    },
    genericName: {
      type: String,
      required: [true, 'Please provide a generic name'],
      lowercase: true,
      trim: true,
      index: true
    },
    scientificName: {
      type: String,
      required: [true, 'Please provide a scientific name'],
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please provide a description']
    },
    form: {
      type: String,
      enum: [
        'tablet',
        'capsule',
        'syrup',
        'injection',
        'cream',
        'ointment',
        'drop',
        'spray',
        'powder',
        'suppository',
        'gel',
        'lotion',
        'patch',
        'inhaler',
        'lozenge',
        'solution',
        'suspension',
        'others'
      ],
      required: [true, "Specify the drug's dosage form"]
    },
    category: {
      type: String,
      enum: [
        'antibiotic',
        'antiviral',
        'antifungal',
        'antiparasitic',
        'painkiller',
        'nsaid',
        'opioid',
        'muscle_relaxant',
        'antipyretic',
        'antihistamine',
        'decongestant',
        'antidepressant',
        'antipsychotic',
        'anxiolytic',
        'sedative',
        'stimulant',
        'antidiabetic',
        'antihypertensive',
        'anticoagulant',
        'lipid_lowering',
        'diuretic',
        'antacid',
        'proton_pump_inhibitor',
        'antiemetic',
        'laxative',
        'antidiarrheal',
        'vaccine',
        'immunosuppressant',
        'hormone',
        'steroid',
        'contraceptive',
        'fertility_drug',
        'antiseptic',
        'topical',
        'anesthetic',
        'vitamin',
        'supplement',
        'bronchodilator',
        'cough_suppressant',
        'expectoran',
        'antidote',
        'rescue_medication',
        'others'
      ],
      required: [true, 'Please provide the type of the drug']
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: true
    },
    sideEffects: {
      type: [String],
      default: []
    },
    dosageInstructions: {
      type: String,
      trim: true,
      default: ''
    },
    picture: {
      type: [String],
      required: [true, 'Please provide at least one picture.'],
      validate: [
        {
          validator: (arr) => Array.isArray(arr) && arr.length > 0,
          message: 'Please provide at least one picture.'
        },
        {
          validator: (arr) => arr.length <= 5,
          message: 'You can upload up to 5 pictures only.'
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

medicineSchema.path('createdAt').select(false);
medicineSchema.path('updatedAt').select(false);

module.exports = mongoose.model('Medicine', medicineSchema);
