'use client';

import OperatorsModal from '@/components/OperatorsModal';
import UploadCards from '@/components/Upload/UploadCards';
import useUpload from '@/hooks/useUpload';
import React from 'react';

export default function UploadPage() {
    const {
        pix,
        recarga,
        modal,
        formData,
        setFormData,
        handleSave,
        handleUpload
    } = useUpload();
    

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload de Dados</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* --- CARD PIX --- */}
                <UploadCards
                    title='Importar Pix'
                    description='Arquivo CSV do relatório de Pix'
                    type='PIX'
                    inputName='arquivo_pix_csv'
                    state={pix}
                    onUpload={handleUpload}
                    themeColor={'green'}
                />

                {/* --- CARD RECARGA --- */}
                <UploadCards
                    title='Importar Recarga'
                    description='Arquivo CSV do relatório de Recarga'
                    type='RECARGA'
                    inputName='arquivo_recarga_csv'
                    state={recarga}
                    onUpload={handleUpload}
                    themeColor={'blue'}
                />

                {/* --- MODAL --- */}
                <OperatorsModal
                    isOpen={modal.isOpen}
                    onClose={modal.close}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    lockMatricula={true}
                />
            </div>
        </div>
    );
}