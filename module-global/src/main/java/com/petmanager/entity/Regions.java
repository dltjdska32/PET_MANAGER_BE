package com.petmanager.entity;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Optional;


/// 지역 - 서버내 캐싱.
@Getter
@RequiredArgsConstructor
public enum Regions {

    // ========== Level 1: 시도 (17개) ==========
    SEOUL(1L, 1, null, "서울특별시"),
    BUSAN(2L, 1, null, "부산광역시"),
    DAEGU(3L, 1, null, "대구광역시"),
    INCHEON(4L, 1, null, "인천광역시"),
    GWANGJU(5L, 1, null, "광주광역시"),
    DAEJEON(6L, 1, null, "대전광역시"),
    ULSAN(7L, 1, null, "울산광역시"),
    SEJONG(8L, 1, null, "세종특별자치시"),
    GYEONGGI(9L, 1, null, "경기도"),
    GANGWON(10L, 1, null, "강원특별자치도"),
    CHUNGBUK(11L, 1, null, "충청북도"),
    CHUNGNAM(12L, 1, null, "충청남도"),
    JEONBUK(13L, 1, null, "전북특별자치도"),
    JEONNAM(14L, 1, null, "전라남도"),
    GYEONGBUK(15L, 1, null, "경상북도"),
    GYEONGNAM(16L, 1, null, "경상남도"),
    JEJU(17L, 1, null, "제주특별자치도"),

    // ========== Level 2: 서울특별시 (25개) ==========
    SEOUL_JONGNO(18L, 2, SEOUL, "종로구"),
    SEOUL_JUNG(19L, 2, SEOUL, "중구"),
    SEOUL_YONGSAN(20L, 2, SEOUL, "용산구"),
    SEOUL_SEONGDONG(21L, 2, SEOUL, "성동구"),
    SEOUL_GWANGJIN(22L, 2, SEOUL, "광진구"),
    SEOUL_DONGDAEMUN(23L, 2, SEOUL, "동대문구"),
    SEOUL_JUNGNANG(24L, 2, SEOUL, "중랑구"),
    SEOUL_SEONGBUK(25L, 2, SEOUL, "성북구"),
    SEOUL_GANGBUK(26L, 2, SEOUL, "강북구"),
    SEOUL_DOBONG(27L, 2, SEOUL, "도봉구"),
    SEOUL_NOWON(28L, 2, SEOUL, "노원구"),
    SEOUL_EUNPYEONG(29L, 2, SEOUL, "은평구"),
    SEOUL_SEODAEMUN(30L, 2, SEOUL, "서대문구"),
    SEOUL_MAPO(31L, 2, SEOUL, "마포구"),
    SEOUL_YANGCHEON(32L, 2, SEOUL, "양천구"),
    SEOUL_GANGSEO(33L, 2, SEOUL, "강서구"),
    SEOUL_GURO(34L, 2, SEOUL, "구로구"),
    SEOUL_GEUMCHEON(35L, 2, SEOUL, "금천구"),
    SEOUL_YEONGDEUNGPO(36L, 2, SEOUL, "영등포구"),
    SEOUL_DONGJAK(37L, 2, SEOUL, "동작구"),
    SEOUL_GWANAK(38L, 2, SEOUL, "관악구"),
    SEOUL_SECHO(39L, 2, SEOUL, "서초구"),
    SEOUL_GANGNAM(40L, 2, SEOUL, "강남구"),
    SEOUL_SONGPA(41L, 2, SEOUL, "송파구"),
    SEOUL_GANGDONG(42L, 2, SEOUL, "강동구"),

    // ========== Level 2: 부산광역시 (16개) ==========
    BUSAN_JUNG(43L, 2, BUSAN, "중구"),
    BUSAN_SEO(44L, 2, BUSAN, "서구"),
    BUSAN_DONG(45L, 2, BUSAN, "동구"),
    BUSAN_YEONGDO(46L, 2, BUSAN, "영도구"),
    BUSAN_BUSANJIN(47L, 2, BUSAN, "부산진구"),
    BUSAN_DONGNAE(48L, 2, BUSAN, "동래구"),
    BUSAN_NAM(49L, 2, BUSAN, "남구"),
    BUSAN_BUK(50L, 2, BUSAN, "북구"),
    BUSAN_HAEUNDAE(51L, 2, BUSAN, "해운대구"),
    BUSAN_SAHA(52L, 2, BUSAN, "사하구"),
    BUSAN_GEUMJEONG(53L, 2, BUSAN, "금정구"),
    BUSAN_GANGSEO(54L, 2, BUSAN, "강서구"),
    BUSAN_YEONJE(55L, 2, BUSAN, "연제구"),
    BUSAN_SUYEONG(56L, 2, BUSAN, "수영구"),
    BUSAN_SASANG(57L, 2, BUSAN, "사상구"),
    BUSAN_GIJANG(58L, 2, BUSAN, "기장군"),

    // ========== Level 2: 대구광역시 (8개) ==========
    DAEGU_JUNG(59L, 2, DAEGU, "중구"),
    DAEGU_DONG(60L, 2, DAEGU, "동구"),
    DAEGU_SEO(61L, 2, DAEGU, "서구"),
    DAEGU_NAMSO(62L, 2, DAEGU, "남구"),
    DAEGU_BUK(63L, 2, DAEGU, "북구"),
    DAEGU_SUSEONG(64L, 2, DAEGU, "수성구"),
    DAEGU_DALSEO(65L, 2, DAEGU, "달서구"),
    DAEGU_DALGUBYEONG(66L, 2, DAEGU, "달성군"),

    // ========== Level 2: 인천광역시 (10개) ==========
    INCHEON_JUNG(67L, 2, INCHEON, "중구"),
    INCHEON_DONG(68L, 2, INCHEON, "동구"),
    INCHEON_MICHEON(69L, 2, INCHEON, "미추홀구"),
    INCHEON_YEONSU(70L, 2, INCHEON, "연수구"),
    INCHEON_NAMDONG(71L, 2, INCHEON, "남동구"),
    INCHEON_BUPYEONG(72L, 2, INCHEON, "부평구"),
    INCHEON_GYEKYANG(73L, 2, INCHEON, "계양구"),
    INCHEON_SEO(74L, 2, INCHEON, "서구"),
    INCHEON_GANGHWA(75L, 2, INCHEON, "강화군"),
    INCHEON_ONGJIN(76L, 2, INCHEON, "옹진군"),

    // ========== Level 2: 광주광역시 (5개) ==========
    GWANGJU_DONG(77L, 2, GWANGJU, "동구"),
    GWANGJU_SEO(78L, 2, GWANGJU, "서구"),
    GWANGJU_NAMSO(79L, 2, GWANGJU, "남구"),
    GWANGJU_BUK(80L, 2, GWANGJU, "북구"),
    GWANGJU_GWANGSAN(81L, 2, GWANGJU, "광산구"),

    // ========== Level 2: 대전광역시 (5개) ==========
    DAEJEON_DONG(82L, 2, DAEJEON, "동구"),
    DAEJEON_JUNG(83L, 2, DAEJEON, "중구"),
    DAEJEON_SEO(84L, 2, DAEJEON, "서구"),
    DAEJEON_YUSEONG(85L, 2, DAEJEON, "유성구"),
    DAEJEON_DAEDEOK(86L, 2, DAEJEON, "대덕구"),

    // ========== Level 2: 울산광역시 (5개) ==========
    ULSAN_JUNG(87L, 2, ULSAN, "중구"),
    ULSAN_NAM(88L, 2, ULSAN, "남구"),
    ULSAN_DONG(89L, 2, ULSAN, "동구"),
    ULSAN_BUK(90L, 2, ULSAN, "북구"),
    ULSAN_ULJU(91L, 2, ULSAN, "울주군"),

    // ========== Level 2: 세종특별자치시 (없음, 시도=시군구) ==========
    SEJONG_SEJONG(92L, 2, SEJONG, "세종시"),

    // ========== Level 2: 경기도 (31개) ==========
    GYEONGGI_SUWON(93L, 2, GYEONGGI, "수원시"),
    GYEONGGI_SEONGNAM(94L, 2, GYEONGGI, "성남시"),
    GYEONGGI_UIJEONGBU(95L, 2, GYEONGGI, "의정부시"),
    GYEONGGI_ANYANG(96L, 2, GYEONGGI, "안양시"),
    GYEONGGI_BUCHEON(97L, 2, GYEONGGI, "부천시"),
    GYEONGGI_GWANGMYEONG(98L, 2, GYEONGGI, "광명시"),
    GYEONGGI_PYEONGTAEK(99L, 2, GYEONGGI, "평택시"),
    GYEONGGI_DONGDUCHEON(100L, 2, GYEONGGI, "동두천시"),
    GYEONGGI_ANSAN(101L, 2, GYEONGGI, "안산시"),
    GYEONGGI_GOYANG(102L, 2, GYEONGGI, "고양시"),
    GYEONGGI_GWACHEON(103L, 2, GYEONGGI, "과천시"),
    GYEONGGI_GURI(104L, 2, GYEONGGI, "구리시"),
    GYEONGGI_NAMYANGJU(105L, 2, GYEONGGI, "남양주시"),
    GYEONGGI_OSAN(106L, 2, GYEONGGI, "오산시"),
    GYEONGGI_SIHEUNG(107L, 2, GYEONGGI, "시흥시"),
    GYEONGGI_GUNPO(108L, 2, GYEONGGI, "군포시"),
    GYEONGGI_UIWANG(109L, 2, GYEONGGI, "의왕시"),
    GYEONGGI_HANAM(110L, 2, GYEONGGI, "하남시"),
    GYEONGGI_YONGIN(111L, 2, GYEONGGI, "용인시"),
    GYEONGGI_PAJU(112L, 2, GYEONGGI, "파주시"),
    GYEONGGI_ICHEON(113L, 2, GYEONGGI, "이천시"),
    GYEONGGI_ANSEONG(114L, 2, GYEONGGI, "안성시"),
    GYEONGGI_GIMPO(115L, 2, GYEONGGI, "김포시"),
    GYEONGGI_HWASEONG(116L, 2, GYEONGGI, "화성시"),
    GYEONGGI_GWANGJU_GYEONGGI(117L, 2, GYEONGGI, "광주시"),
    GYEONGGI_YANGJU(118L, 2, GYEONGGI, "양주시"),
    GYEONGGI_POCHEON(119L, 2, GYEONGGI, "포천시"),
    GYEONGGI_YEOJU(120L, 2, GYEONGGI, "여주시"),
    GYEONGGI_YANGPYEONG(121L, 2, GYEONGGI, "양평군"),
    GYEONGGI_GAPYEONG(122L, 2, GYEONGGI, "가평군"),
    GYEONGGI_YEONCHEON(123L, 2, GYEONGGI, "연천군"),

    // ========== Level 2: 강원특별자치도 (18개) ==========
    GANGWON_CHUNCHEON(124L, 2, GANGWON, "춘천시"),
    GANGWON_WONJU(125L, 2, GANGWON, "원주시"),
    GANGWON_GANGNEUNG(126L, 2, GANGWON, "강릉시"),
    GANGWON_DONGHAE(127L, 2, GANGWON, "동해시"),
    GANGWON_TAEBAEK(128L, 2, GANGWON, "태백시"),
    GANGWON_SOKCHO(129L, 2, GANGWON, "속초시"),
    GANGWON_SAMCHEOK(130L, 2, GANGWON, "삼척시"),
    GANGWON_HONGCHEON(131L, 2, GANGWON, "홍천군"),
    GANGWON_HOENGSEONG(132L, 2, GANGWON, "횡성군"),
    GANGWON_YEONGWOL(133L, 2, GANGWON, "영월군"),
    GANGWON_PYEONGCHANG(134L, 2, GANGWON, "평창군"),
    GANGWON_JEONGSEON(135L, 2, GANGWON, "정선군"),
    GANGWON_CHEORWON(136L, 2, GANGWON, "철원군"),
    GANGWON_HWACHEON(137L, 2, GANGWON, "화천군"),
    GANGWON_YANGGU(138L, 2, GANGWON, "양구군"),
    GANGWON_INJE(139L, 2, GANGWON, "인제군"),
    GANGWON_GOSEONG(140L, 2, GANGWON, "고성군"),
    GANGWON_YANGYANG(141L, 2, GANGWON, "양양군"),

    // ========== Level 2: 충청북도 (11개) ==========
    CHUNGBUK_CHEONGJU(142L, 2, CHUNGBUK, "청주시"),
    CHUNGBUK_CHUNGJU(143L, 2, CHUNGBUK, "충주시"),
    CHUNGBUK_JECHEON(144L, 2, CHUNGBUK, "제천시"),
    CHUNGBUK_BOEUN(145L, 2, CHUNGBUK, "보은군"),
    CHUNGBUK_OKCHEON(146L, 2, CHUNGBUK, "옥천군"),
    CHUNGBUK_YEONGDONG(147L, 2, CHUNGBUK, "영동군"),
    CHUNGBUK_JINCHEON(148L, 2, CHUNGBUK, "진천군"),
    CHUNGBUK_GOESAN(149L, 2, CHUNGBUK, "괴산군"),
    CHUNGBUK_EUMSEONG(150L, 2, CHUNGBUK, "음성군"),
    CHUNGBUK_DANYANG(151L, 2, CHUNGBUK, "단양군"),
    CHUNGBUK_JEUNGPYEONG(152L, 2, CHUNGBUK, "증평군"),

    // ========== Level 2: 충청남도 (15개) ==========
    CHUNGNAM_CHEONAN(153L, 2, CHUNGNAM, "천안시"),
    CHUNGNAM_GONGJU(154L, 2, CHUNGNAM, "공주시"),
    CHUNGNAM_BORYEONG(155L, 2, CHUNGNAM, "보령시"),
    CHUNGNAM_ASAN(156L, 2, CHUNGNAM, "아산시"),
    CHUNGNAM_SEOSAN(157L, 2, CHUNGNAM, "서산시"),
    CHUNGNAM_NONSAN(158L, 2, CHUNGNAM, "논산시"),
    CHUNGNAM_GYERYONG(159L, 2, CHUNGNAM, "계룡시"),
    CHUNGNAM_DANGJIN(160L, 2, CHUNGNAM, "당진시"),
    CHUNGNAM_GEUMSAN(161L, 2, CHUNGNAM, "금산군"),
    CHUNGNAM_BUYEO(162L, 2, CHUNGNAM, "부여군"),
    CHUNGNAM_SEOCHEON(163L, 2, CHUNGNAM, "서천군"),
    CHUNGNAM_CHEONGYANG(164L, 2, CHUNGNAM, "청양군"),
    CHUNGNAM_HONGSEONG(165L, 2, CHUNGNAM, "홍성군"),
    CHUNGNAM_YESAN(166L, 2, CHUNGNAM, "예산군"),
    CHUNGNAM_TAEAN(167L, 2, CHUNGNAM, "태안군"),

    // ========== Level 2: 전북특별자치도 (14개) ==========
    JEONBUK_JEONJU(168L, 2, JEONBUK, "전주시"),
    JEONBUK_GUNSAN(169L, 2, JEONBUK, "군산시"),
    JEONBUK_IKSAN(170L, 2, JEONBUK, "익산시"),
    JEONBUK_JEONGEUP(171L, 2, JEONBUK, "정읍시"),
    JEONBUK_NAMWON(172L, 2, JEONBUK, "남원시"),
    JEONBUK_GIMJE(173L, 2, JEONBUK, "김제시"),
    JEONBUK_WANJU(174L, 2, JEONBUK, "완주군"),
    JEONBUK_JINAN(175L, 2, JEONBUK, "진안군"),
    JEONBUK_MUJU(176L, 2, JEONBUK, "무주군"),
    JEONBUK_JANGSU(177L, 2, JEONBUK, "장수군"),
    JEONBUK_IMSIL(178L, 2, JEONBUK, "임실군"),
    JEONBUK_SUNCHANG(179L, 2, JEONBUK, "순창군"),
    JEONBUK_GOCHANG(180L, 2, JEONBUK, "고창군"),
    JEONBUK_BUAN(181L, 2, JEONBUK, "부안군"),

    // ========== Level 2: 전라남도 (22개) ==========
    JEONNAM_MOKPO(182L, 2, JEONNAM, "목포시"),
    JEONNAM_YEOSU(183L, 2, JEONNAM, "여수시"),
    JEONNAM_SUNCHEON(184L, 2, JEONNAM, "순천시"),
    JEONNAM_NAJU(185L, 2, JEONNAM, "나주시"),
    JEONNAM_GOGEUNG(186L, 2, JEONNAM, "광양시"),
    JEONNAM_DAMYANG(187L, 2, JEONNAM, "담양군"),
    JEONNAM_GOKSEONG(188L, 2, JEONNAM, "곡성군"),
    JEONNAM_GURYE(189L, 2, JEONNAM, "구례군"),
    JEONNAM_GOHEUNG(190L, 2, JEONNAM, "고흥군"),
    JEONNAM_BOSEONG(191L, 2, JEONNAM, "보성군"),
    JEONNAM_HWASUN(192L, 2, JEONNAM, "화순군"),
    JEONNAM_JANGHEUNG(193L, 2, JEONNAM, "장흥군"),
    JEONNAM_GANGJIN(194L, 2, JEONNAM, "강진군"),
    JEONNAM_HAENAM(195L, 2, JEONNAM, "해남군"),
    JEONNAM_YEONGAM(196L, 2, JEONNAM, "영암군"),
    JEONNAM_MUAN(197L, 2, JEONNAM, "무안군"),
    JEONNAM_HAMPYEONG(198L, 2, JEONNAM, "함평군"),
    JEONNAM_YEONGGWANG(199L, 2, JEONNAM, "영광군"),
    JEONNAM_JANGSEONG(200L, 2, JEONNAM, "장성군"),
    JEONNAM_WANDO(201L, 2, JEONNAM, "완도군"),
    JEONNAM_JINDO(202L, 2, JEONNAM, "진도군"),
    JEONNAM_SINAN(203L, 2, JEONNAM, "신안군"),

    // ========== Level 2: 경상북도 (23개) ==========
    GYEONGBUK_POHANG(204L, 2, GYEONGBUK, "포항시"),
    GYEONGBUK_GYEONGJU(205L, 2, GYEONGBUK, "경주시"),
    GYEONGBUK_GIMCHEON(206L, 2, GYEONGBUK, "김천시"),
    GYEONGBUK_ANDONG(207L, 2, GYEONGBUK, "안동시"),
    GYEONGBUK_GUMI(208L, 2, GYEONGBUK, "구미시"),
    GYEONGBUK_YEONGJU(209L, 2, GYEONGBUK, "영주시"),
    GYEONGBUK_YEONGCHON(210L, 2, GYEONGBUK, "영천시"),
    GYEONGBUK_SANGJU(211L, 2, GYEONGBUK, "상주시"),
    GYEONGBUK_MUNGYEONG(212L, 2, GYEONGBUK, "문경시"),
    GYEONGBUK_GYEONGSAN(213L, 2, GYEONGBUK, "경산시"),
    GYEONGBUK_GUNWI(214L, 2, GYEONGBUK, "군위군"),
    GYEONGBUK_UISEONG(215L, 2, GYEONGBUK, "의성군"),
    GYEONGBUK_CHEONGSONG(216L, 2, GYEONGBUK, "청송군"),
    GYEONGBUK_YEONGYANG(217L, 2, GYEONGBUK, "영양군"),
    GYEONGBUK_YEONGDEOK(218L, 2, GYEONGBUK, "영덕군"),
    GYEONGBUK_CHEONGDO(219L, 2, GYEONGBUK, "청도군"),
    GYEONGBUK_GORYEONG(220L, 2, GYEONGBUK, "고령군"),
    GYEONGBUK_SEONGJU(221L, 2, GYEONGBUK, "성주군"),
    GYEONGBUK_CHILGOK(222L, 2, GYEONGBUK, "칠곡군"),
    GYEONGBUK_YECHON(223L, 2, GYEONGBUK, "예천군"),
    GYEONGBUK_BONGHWA(224L, 2, GYEONGBUK, "봉화군"),
    GYEONGBUK_ULJIN(225L, 2, GYEONGBUK, "울진군"),
    GYEONGBUK_ULLEUNG(226L, 2, GYEONGBUK, "울릉군"),

    // ========== Level 2: 경상남도 (18개) ==========
    GYEONGNAM_CHANGWON(227L, 2, GYEONGNAM, "창원시"),
    GYEONGNAM_JINJU(228L, 2, GYEONGNAM, "진주시"),
    GYEONGNAM_TONGYEONG(229L, 2, GYEONGNAM, "통영시"),
    GYEONGNAM_SACHEON(230L, 2, GYEONGNAM, "사천시"),
    GYEONGNAM_GIMHAE(231L, 2, GYEONGNAM, "김해시"),
    GYEONGNAM_MIRYANG(232L, 2, GYEONGNAM, "밀양시"),
    GYEONGNAM_GEOJE(233L, 2, GYEONGNAM, "거제시"),
    GYEONGNAM_YANGSAN(234L, 2, GYEONGNAM, "양산시"),
    GYEONGNAM_UIREONG(235L, 2, GYEONGNAM, "의령군"),
    GYEONGNAM_HAMAN(236L, 2, GYEONGNAM, "함안군"),
    GYEONGNAM_CHANGNYEONG(237L, 2, GYEONGNAM, "창녕군"),
    GYEONGNAM_GOSEONG(238L, 2, GYEONGNAM, "고성군"),
    GYEONGNAM_NAMHAE(239L, 2, GYEONGNAM, "남해군"),
    GYEONGNAM_HADONG(240L, 2, GYEONGNAM, "하동군"),
    GYEONGNAM_SANCHEON(241L, 2, GYEONGNAM, "산청군"),
    GYEONGNAM_HAMYANG(242L, 2, GYEONGNAM, "함양군"),
    GYEONGNAM_GEochang(243L, 2, GYEONGNAM, "거창군"),
    GYEONGNAM_HAPCHEON(244L, 2, GYEONGNAM, "합천군"),

    // ========== Level 2: 제주특별자치도 (2개) ==========
    JEJU_JEJU(245L, 2, JEJU, "제주시"),
    JEJU_SEOGWIPO(246L, 2, JEJU, "서귀포시");

    private final Long id;             // ID 값 (1부터 시작)
    private final int level;           // 1: 시도, 2: 시군구
    private final Regions parent;      // 부모 시도 (시도는 null, 시군구는 해당 시도)
    private final String regionName;   // 지역명

    // 부모가 있는지 확인
    public boolean hasParent() {
        return parent != null;
    }



    // 시도인지 확인
    public boolean isSido() {
        return level == 1;
    }

    // 시군구인지 확인
    public boolean isSigungu() {
        return level == 2;
    }

    public static Optional<Regions> getRegionById(Long id) {

        Optional<Regions> result = Optional.empty();

        for (Regions regions : Regions.getAllSido()) {

            if (regions.getId().equals(id)) {
                result = Optional.of(regions);
            }
        }

        return result;
    }

    // 모든 시도 목록 조회
    public static Regions[] getAllSido() {
        return java.util.Arrays.stream(values())
                .filter(Regions::isSido)
                .toArray(Regions[]::new);
    }

    // 특정 시도의 시군구 목록 조회
    public static Regions[] getSigunguBySido(Regions sido) {
        return java.util.Arrays.stream(values())
                .filter(r -> r.isSigungu() && r.getParent() == sido)
                .toArray(Regions[]::new);
    }
}