import type { CustomDhikrReminderEntity, DhikrItemEntity } from '../types/models';

export interface DhikrSubCounter {
  key: string;
  labelAr: string;
  target: number;
  current: number;
}

export const APPROVED_INTERVAL_MINUTES = [10, 20, 30, 40, 50, 60] as const;

export const DEFAULT_CUSTOM_REMINDER_TEXTS = [
  'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين',
  'اللهم صل وسلم وبارك على نبينا محمد',
  'سبحان الله',
  'الحمد لله',
  'لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير',
  'الله أكبر',
];

export const TASBEEH_PRESETS = [
  'سبحان الله',
  'الحمد لله',
  'الله أكبر',
  'لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير',
  'سبحان الله وبحمده سبحان الله العظيم',
  'أستغفر الله العظيم وأتوب إليه',
  'اللهم صل وسلم وبارك على نبينا محمد',
];

const TEXT_AYAT_KURSI =
  'أَعُوذُ بِاللَّهِ مِنَ الشَّيطَانِ الرَّجِيمِ ﴿اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾.';

const TEXT_SURAH_IKHLAS =
  'بسم الله الرحمن الرحيم ﴿قُلْ هُوَ اللَّهُ أَحَدٌ* اللَّهُ الصَّمَدُ* لَمْ يَلِدْ وَلَمْ يُولَدْ* وَلَمْ يَكُن لَّهُ كُفُواً أَحَدٌ﴾.';

const TEXT_SURAH_FALAQ =
  'بسم الله الرحمن الرحيم ﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ* مِن شَرِّ مَا خَلَقَ* وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ* وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ* وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾.';

const TEXT_SURAH_NAS =
  'بسم الله الرحمن الرحيم ﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ* مَلِكِ النَّاسِ* إِلَهِ النَّاسِ* مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ* الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ* مِنَ الْجِنَّةِ وَ النَّاسِ﴾.';

const TEXT_SAYYID_ISTIGHFAR =
  '((اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنوبَ إِلاَّ أَنْتَ)).';

const TEXT_AAFINI_BADANI =
  '((اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ)).';

const TEXT_HASBIYA_ALLAH =
  '((حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ)).';

const TEXT_ALAFW_WALAFIYAH =
  '((اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ: فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَينِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي)).';

const TEXT_ALIM_ALGHAYB =
  '((اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطانِ وَشَرَكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ)).';

const TEXT_BISMILLAH_LA_YADURR =
  '((بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ)).';

const TEXT_RADITU_BILLAH =
  '((رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً)).';

const TEXT_YA_HAYYU =
  '((يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغيثُ أَصْلِحْ لِي شَأْنِيَ كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ)).';

const TEXT_SUBHANALLAH_WABIHAMDIH = '((سُبْحَانَ اللَّهِ وَبِحَمْدِهِ)).';

const TEXT_LA_ILAHA_10_OR_1 =
  '((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)).';

const TEXT_LA_ILAHA_100 =
  '((لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ)).';

const TEXT_ASTAGHFIRULLAH_100 = '((أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ)).';
const TEXT_SALAT_PROPHET_10 = '((اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ)).';

export const TEXT_SURAH_AS_SAJDAH =
  'الٓمٓ (1) تَنزِيلُ ٱلۡكِتَٰبِ لَا رَيۡبَ فِيهِ مِن رَّبِّ ٱلۡعَٰلَمِينَ (2) أَمۡ يَقُولُونَ ٱفۡتَرَىٰهُۚ بَلۡ هُوَ ٱلۡحَقُّ مِن رَّبِّكَ لِتُنذِرَ قَوۡمٗا مَّآ أَتَىٰهُم مِّن نَّذِيرٖ مِّن قَبۡلِكَ لَعَلَّهُمۡ يَهۡتَدُونَ (3) ٱللَّهُ ٱلَّذِي خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَ وَمَا بَيۡنَهُمَا فِي سِتَّةِ أَيَّامٖ ثُمَّ ٱسۡتَوَىٰ عَلَى ٱلۡعَرۡشِۖ مَا لَكُم مِّن دُونِهِۦ مِن وَلِيّٖ وَلَا شَفِيعٍۚ أَفَلَا تَتَذَكَّرُونَ (4) يُدَبِّرُ ٱلۡأَمۡرَ مِنَ ٱلسَّمَآءِ إِلَى ٱلۡأَرۡضِ ثُمَّ يَعۡرُجُ إِلَيۡهِ فِي يَوۡمٖ كَانَ مِقۡدَارُهُۥٓ أَلۡفَ سَنَةٖ مِّمَّا تَعُدُّونَ (5) ذَٰلِكَ عَٰلِمُ ٱلۡغَيۡبِ وَٱلشَّهَٰدَةِ ٱلۡعَزِيزُ ٱلرَّحِيمُ (6) ٱلَّذِيٓ أَحۡسَنَ كُلَّ شَيۡءٍ خَلَقَهُۥۖ وَبَدَأَ خَلۡقَ ٱلۡإِنسَٰنِ مِن طِينٖ (7) ثُمَّ جَعَلَ نَسۡلَهُۥ مِن سُلَٰلَةٖ مِّن مَّآءٖ مَّهِينٖ (8) ثُمَّ سَوَّىٰهُ وَنَفَخَ فِيهِ مِن رُّوحِهِۦۖ وَجَعَلَ لَكُمُ ٱلسَّمۡعَ وَٱلۡأَبۡصَٰرَ وَٱلۡأَفۡـِٔدَةَۚ قَلِيلٗا مَّا تَشۡكُرُونَ (9) وَقَالُوٓاْ أَءِذَا ضَلَلۡنَا فِي ٱلۡأَرۡضِ أَءِنَّا لَفِي خَلۡقٖ جَدِيدِۭۚ بَلۡ هُم بِلِقَآءِ رَبِّهِمۡ كَٰفِرُونَ (10) ۞قُلۡ يَتَوَفَّىٰكُم مَّلَكُ ٱلۡمَوۡتِ ٱلَّذِي وُكِّلَ بِكُمۡ ثُمَّ إِلَىٰ رَبِّكُمۡ تُرۡجَعُونَ (11) وَلَوۡ تَرَىٰٓ إِذِ ٱلۡمُجۡرِمُونَ نَاكِسُواْ رُءُوسِهِمۡ عِندَ رَبِّهِمۡ رَبَّنَآ أَبۡصَرۡنَا وَسَمِعۡنَا فَٱرۡجِعۡنَا نَعۡمَلۡ صَٰلِحًا إِنَّا مُوقِنُونَ (12) وَلَوۡ شِئۡنَا لَأٓتَيۡنَا كُلَّ نَفۡسٍ هُدَىٰهَا وَلَٰكِنۡ حَقَّ ٱلۡقَوۡلُ مِنِّي لَأَمۡلَأَنَّ جَهَنَّمَ مِنَ ٱلۡجِنَّةِ وَالنَّاسِ أَجۡمَعِينَ (13) فَذُوقُواْ بِمَا نَسِيتُمۡ لِقَآءَ يَوۡمِكُمۡ هَٰذَآ إِنَّا نَسِينَٰكُمۡۖ وَذُوقُواْ عَذَابَ ٱلۡخُلۡدِ بِمَا كُنتُمۡ تَعۡمَلُونَ (14) إِنَّمَا يُؤۡمِنُ بِـَٔايَٰتِنَا ٱلَّذِينَ إِذَا ذُكِّرُواْ بِهَا خَرُّواْۤ سُجَّدٗاۤ وَسَبَّحُواْ بِحَمۡدِ رَبِّهِمۡ وَهُمۡ لَا يَسۡتَكۡبِرُونَ۩ (15) تَتَجَافَىٰ جُنُوبُهُمۡ عَنِ ٱلۡمَضَاجِعِ يَدۡعُونَ رَبَّهُمۡ خَوۡفٗا وَطَمَعٗا وَمِمَّا رَزَقۡنَٰهُمۡ يُنفِقُونَ (16) فَلَا تَعۡلَمُ نَفۡسٞ مَّآ أُخۡفِيَ لَهُم مِّن قُرَّةِ أَعۡيُنٖ جَزَآءَۢ بِمَا كَانُواْ يَعۡمَلُونَ (17) أَفَمَن كَانَ مُؤۡمِنٗا كَمَن كَانَ فَاسِقٗاۚ لَّا يَسۡتَوُۥنَ (18) أَمَّا ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّٰلِحَٰتِ فَلَهُمۡ جَنَّٰتُ ٱلۡمَأۡوَىٰ نُزُلَۢا بِمَا كَانُواْ يَعۡمَلُونَ (19) وَأَمَّا ٱلَّذِينَ فَسَقُواْ فَمَأۡوَىٰهُمُ ٱلنَّارُۖ كُلَّمَآ أَرَادُوٓاْ أَن يَخۡرُجُواْ مِنۡهَآ أُعِيدُواْ فِيهَا وَقِيلَ لَهُمۡ ذُوقُواْ عَذَابَ ٱلنَّارِ ٱلَّذِي كُنتُم بِهِۦ تُكَذِّبُونَ (20) وَلَنُذِيقَنَّهُم مِّنَ ٱلۡعَذَابِ ٱلۡأَدۡنَىٰ دُونَ ٱلۡعَذَابِ ٱلۡأَكۡبَرِ لَعَلَّهُمۡ يَرۡجِعُونَ (21) وَمَنۡ أَظۡلَمُ مِمَّن ذُكِّرَ بِـَٔايَٰتِ رَبِّهِۦ ثُمَّ أَعۡرَضَ عَنۡهَآۚ إِنَّا مِنَ ٱلۡمُجۡرِمِينَ مُنتَقِمُونَ (22) وَلَقَدۡ ءَاتَيۡنَا مُوسَى ٱلۡكِتَٰبَ فَلَا تَكُن فِي مِرۡيَةٖ مِّن لِّقَآئِهِۦۖ وَجَعَلۡنَٰهُ هُدٗى لِّبَنِيٓ إِسۡرَٰٓءِيلَ (23) وَجَعَلۡنَا مِنۡهُمۡ أَئِمَّةٗ يَهۡدُونَ بِأَمۡرِنَا لَمَّا صَبَرُواْۖ وَكَانُواْ بِـَٔايَٰتِنَا يُوقِنُونَ (24) إِنَّ رَبَّكَ هُوَ يَفۡصِلُ بَيۡنَهُمۡ يَوۡمَ ٱلۡقِيَٰمَةِ فِيمَا كَانُواْ فِيهِ يَخۡتَلِفُونَ (25) أَوَلَمۡ يَهۡدِ لَهُمۡ كَمۡ أَهۡلَكۡنَا مِن قَبۡلِهِم مِّنَ ٱلۡقُرُونِ يَمۡشُونَ فِي مَسَٰكِنِهِمۡۚ إِنَّ فِي ذَٰلِكَ لَأٓيَٰتٍۚ أَفَلَا يَسۡمَعُونَ (26) أَوَلَمۡ يَرَوۡاْ أَنَّا نَسُوقُ ٱلۡمَآءَ إِلَى ٱلۡأَرۡضِ ٱلۡجُرُزِ فَنُخۡرِجُ بِهِۦ زَرۡعٗا تَأۡكُلُ مِنۡهُ أَنۡعَٰمُهُمۡ وَأَنفُسُهُمۡۚ أَفَلَا يُبۡصِرُونَ (27) وَيَقُولُونَ مَتَىٰ هَٰذَا ٱلۡفَتۡحُ إِن كُنتُمۡ صَٰدِقِينَ (28) قُلۡ يَوۡمَ ٱلۡفَتۡحِ لَا يَنفَعُ ٱلَّذِينَ كَفَرُوٓاْ إِيمَٰنُهُمۡ وَلَا هُمۡ يُنظَرُونَ (29) فَأَعۡرِضۡ عَنۡهُمۡ وَٱنتَظِرۡ إِنَّهُم مُّنتَظِرُونَ (30)';

export const TEXT_SURAH_AL_MULK =
  'تَبَٰرَكَ ٱلَّذِي بِيَدِهِ ٱلۡمُلۡكُ وَهُوَ عَلَىٰ كُلِّ شَيۡءٖ قَدِيرٌ (1) ٱلَّذِي خَلَقَ ٱلۡمَوۡتَ وَٱلۡحَيَوٰةَ لِيَبۡلُوَكُمۡ أَيُّكُمۡ أَحۡسَنُ عَمَلٗاۚ وَهُوَ ٱلۡعَزِيزُ ٱلۡغَفُورُ (2) ٱلَّذِي خَلَقَ سَبۡعَ سَمَٰوَٰتٖ طِبَاقٗاۖ مَّا تَرَىٰ فِي خَلۡقِ ٱلرَّحۡمَٰنِ مِن تَفَٰوُتٖۖ فَٱرۡجِعِ ٱلۡبَصَرَ هَلۡ تَرَىٰ مِن فُطُورٖ (3) ثُمَّ ٱرۡجِعِ ٱلۡبَصَرَ كَرَّتَيۡنِ يَنقَلِبۡ إِلَيۡكَ ٱلۡبَصَرُ خَاسِئٗا وَهُوَ حَسِيرٞ (4) وَلَقَدۡ زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنۡيَا بِمَصَٰبِيحَ وَجَعَلۡنَٰهَا رُجُومٗا لِّلشَّيَٰطِينِۖ وَأَعۡتَدۡنَا لَهُمۡ عَذَابَ ٱلسَّعِيرِ (5) وَلِلَّذِينَ كَفَرُواْ بِرَبِّهِمۡ عَذَابُ جَهَنَّمَۖ وَبِئۡسَ ٱلۡمَصِيرُ (6) إِذَآ أُلۡقُواْ فِيهَا سَمِعُواْ لَهَا شَهِيقٗا وَهِيَ تَفُورُ (7) تَكَادُ تَمَيَّزُ مِنَ ٱلۡغَيۡظِۖ كُلَّمَآ أُلۡقِيَ فِيهَا فَوۡجٞ سَأَلَهُمۡ خَزَنَتُهَآ أَلَمۡ يَأۡتِكُمۡ نَذِيرٞ (8) قَالُواْ بَلَىٰ قَدۡ جَآءَنَا نَذِيرٞ فَكَذَّبۡنَا وَقُلۡنَا مَا نَزَّلَ ٱللَّهُ مِن شَيۡءٍ إِنۡ أَنتُمۡ إِلَّا فِي ضَلَٰلٖ كَبِيرٖ (9) وَقَالُواْ لَوۡ كُنَّا نَسۡمَعُ أَوۡ نَعۡقِلُ مَا كُنَّا فِيٓ أَصۡحَٰبِ ٱلسَّعِيرِ (10) فَٱعۡتَرَفُواْ بِذَنۢبِهِمۡ فَسُحۡقٗا لِّأَصۡحَٰبِ ٱلسَّعِيرِ (11) إِنَّ ٱلَّذِينَ يَخۡشَوۡنَ رَبَّهُم بِٱلۡغَيۡبِ لَهُم مَّغۡفِرَةٞ وَأَجۡرٞ كَبِيرٞ (12) وَأَسِرُّواْ قَوۡلَكُمۡ أَوِ ٱجۡهَرُواْ بِهِۦٓۖ إِنَّهُۥ عَلِيمُۢ بِذَاتِ ٱلصُّدُورِ (13) أَلَا يَعۡلَمُ مَنۡ خَلَقَ وَهُوَ ٱللَّطِيفُ ٱلۡخَبِيرُ (14) هُوَ ٱلَّذِي جَعَلَ لَكُمُ ٱلۡأَرْضَ ذَلُولٗا فَٱمۡشُواْ فِي مَنَاكِبِهَا وَكُلُواْ مِن رِّزۡقِهِۦۖ وَإِلَيۡهِ ٱلنُّشُورُ (15) ءَأَمِنتُم مَّن فِي ٱلسَّمَآءِ أَن يَخۡسِفَ بِكُمُ ٱلۡأَرْضَ فَإِذَا هِيَ تَمُورُ (16) أَمۡ أَمِنتُم مَّن فِي ٱلسَّمَآءِ أَن يُرۡسِلَ عَلَيۡكُمۡ حَاصِبٗاۖ فَسَتَعۡلَمُونَ كَيۡفَ نَذِيرِ (17) وَلَقَدۡ كَذَّبَ ٱلَّذِينَ مِن قَبۡلِهِمۡ فَكَيۡفَ كَانَ نَكِيرِ (18) أَوَلَمۡ يَرَوۡاْ إِلَى ٱلطَّيۡرِ فَوۡقَهُمۡ صَٰٓفَّٰتٖ وَيَقۡبِضۡنَۚ مَا يُمۡسِكُهُنَّ إِلَّا ٱلرَّحۡمَٰنُۚ إِنَّهُۥ بِكُلِّ شَيۡءِۭ بَصِيرٌ (19) أَمَّنۡ هَٰذَا ٱلَّذِي هُوَ جُندٞ لَّكُمۡ يَنصُرُكُم مِّن دُونِ ٱلرَّحۡمَٰنِۚ إِنِ ٱلۡكَٰفِرُونَ إِلَّا فِي غُرُورٍ (20) أَمَّنۡ هَٰذَا ٱلَّذِي يَرۡزُقُكُمۡ إِنۡ أَمۡسَكَ رِزۡقَهُۥۚ بَل لَّجُّواْ فِي عُتُوّٖ وَنُفُورٍ (21) أَفَمَن يَمۡشِي مُكِبًّا عَلَىٰ وَجۡهِهِۦٓ أَهۡدَىٰٓ أَمَّن يَمۡشِي سَوِيًّا عَلَىٰ صِرَٰطٖ مُّسۡتَقِيمٖ (22) قُلۡ هُوَ ٱلَّذِيٓ أَنشَأَكُمۡ وَجَعَلَ لَكُمُ ٱلسَّمۡعَ وَٱلۡأَبۡصَٰرَ وَٱلۡأَفۡـِٔدَةَۚ قَلِيلٗا مَّا تَشۡكُرُونَ (23) قُلۡ هُوَ ٱلَّذِي ذَرَأَكُمۡ فِي ٱلۡأَرْضِ وَإِلَيۡهِ تُحۡشَرُونَ (24) وَيَقُولُونَ مَتَىٰ هَٰذَا ٱلۡوَعۡدُ إِن كُنتُمۡ صَٰدِقِينَ (25) قُلۡ إِنَّمَا ٱلۡعِلۡمُ عِندَ ٱللَّهِ وَإِنَّمَآ أَنَا۠ نَذِيرٞ مُّبِينٞ (26) فَلَمَّا رَأَوۡهُ زُلۡفَةٗ سِيٓـَٔتۡ وُجُوهُ ٱلَّذِينَ كَفَرُواْ وَقِيلَ هَٰذَا ٱلَّذِي كُنتُم بِهِۦ تَدَّعُونَ (27) قُلۡ أَرَءَيۡتُمۡ إِنۡ أَهۡلَكَنِيَ ٱللَّهُ وَمَن مَّعِيَ أَوۡ رَحِمَنَا فَمَن يُجِيرُ ٱلۡكَٰفِرِينَ مِنۡ عَذَابٍ أَلِيمٖ (28) قُلۡ هُوَ ٱلرَّحۡمَٰنُ ءَامَنَّا بِهِۦ وَعَلَيۡهِ تَوَكَّلۡنَاۖ فَسَتَعۡلَمُونَ مَنۡ هُوَ فِي ضَلَٰلٖ مُّبِينٖ (29) قُلۡ أَرَءَيۡتُمۡ إِنۡ أَصۡبَحَ مَآؤُكُمۡ غَوۡرٗا فَمَن يَأۡتِيكُم بِمَآءٖ مَّعِينِۭ (30)';

export function defaultSleepTasbeehSubCounters(): DhikrSubCounter[] {
  return [
    { key: 'subhanallah', labelAr: '((سُبْحَانَ اللَّهِ)).', target: 33, current: 0 },
    { key: 'alhamdulillah', labelAr: '((وَالْحَمْدُ لِلَّهِ)).', target: 33, current: 0 },
    { key: 'allahuakbar', labelAr: '((وَاللَّهُ أَكْبَرُ)).', target: 34, current: 0 },
  ];
}

export function serializeSubCounters(counters: DhikrSubCounter[]): string {
  return counters
    .map(
      (c) =>
        `${c.key}|${c.labelAr.replace(/\|/g, ' ').replace(/\n/g, ' ')}|${c.target}|${c.current}`
    )
    .join('\n');
}

export function parseSubCounters(serialized?: string | null): DhikrSubCounter[] {
  if (!serialized || !serialized.trim()) return [];
  return serialized
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const parts = line.split('|');
      if (parts.length < 4) return null;
      const target = Math.max(1, Number.parseInt(parts[2], 10) || 1);
      const rawCur = Number.parseInt(parts[3], 10) || 0;
      const current = Math.max(0, Math.min(target, rawCur));
      return {
        key: parts[0],
        labelAr: parts[1],
        target,
        current,
      };
    })
    .filter((x): x is DhikrSubCounter => x !== null);
}

function makeItem(
  id: number,
  partial: Omit<
    DhikrItemEntity,
    | 'id'
    | 'currentCount'
    | 'isCompleted'
    | 'isHidden'
    | 'isUserCustom'
    | 'isQuranic'
    | 'countOrigin'
  > & {
    countOrigin?: 'explicit' | 'default_editable';
    isQuranic?: boolean;
  }
): DhikrItemEntity {
  return {
    id,
    currentCount: 0,
    isCompleted: false,
    isHidden: false,
    isUserCustom: false,
    isQuranic: partial.isQuranic ?? false,
    countOrigin: partial.countOrigin ?? 'explicit',
    ...partial,
  };
}

export function defaultDhikrItems(): DhikrItemEntity[] {
  let id = 1;
  const items: DhikrItemEntity[] = [];

  // Morning (25 items)
  const morningRaw: Array<Parameters<typeof makeItem>[1]> = [
    {
      stableKey: 'morning_01',
      collectionType: 'morning',
      titleAr: 'آية الكرسي',
      textAr: TEXT_AYAT_KURSI,
      referenceAr: 'سورة البقرة: 255',
      instructionsAr: 'تُقرأ مرة واحدة',
      targetCount: 1,
      sortOrder: 0,
      isQuranic: true,
    },
    {
      stableKey: 'morning_02',
      collectionType: 'morning',
      titleAr: 'سورة الإخلاص',
      textAr: TEXT_SURAH_IKHLAS,
      referenceAr: 'سورة الإخلاص',
      instructionsAr: 'تُقرأ ثلاث مرات',
      targetCount: 3,
      sortOrder: 1,
      isQuranic: true,
    },
    {
      stableKey: 'morning_03',
      collectionType: 'morning',
      titleAr: 'سورة الفلق',
      textAr: TEXT_SURAH_FALAQ,
      referenceAr: 'سورة الفلق',
      instructionsAr: 'تُقرأ ثلاث مرات',
      targetCount: 3,
      sortOrder: 2,
      isQuranic: true,
    },
    {
      stableKey: 'morning_04',
      collectionType: 'morning',
      titleAr: 'سورة الناس',
      textAr: TEXT_SURAH_NAS,
      referenceAr: 'سورة الناس',
      instructionsAr: 'تُقرأ ثلاث مرات',
      targetCount: 3,
      sortOrder: 3,
      isQuranic: true,
    },
    {
      stableKey: 'morning_05',
      collectionType: 'morning',
      titleAr: 'أصبحنا وأصبح الملك لله',
      textAr:
        '((أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ)).',
      referenceAr: 'رواه مسلم',
      targetCount: 1,
      sortOrder: 4,
      variantGroup: 'morning',
    },
    {
      stableKey: 'morning_06',
      collectionType: 'morning',
      titleAr: 'اللهم بك أصبحنا',
      textAr:
        '((اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ)).',
      referenceAr: 'رواه الترمذي',
      targetCount: 1,
      sortOrder: 5,
      variantGroup: 'morning',
    },
    {
      stableKey: 'morning_07',
      collectionType: 'morning',
      titleAr: 'سيد الاستغفار',
      textAr: TEXT_SAYYID_ISTIGHFAR,
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 6,
    },
    {
      stableKey: 'morning_08',
      collectionType: 'morning',
      titleAr: 'اللهم إني أصبحت أشهدك',
      textAr:
        '((اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتِكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ)).',
      referenceAr: 'رواه أبو داود (أربع مرات)',
      targetCount: 4,
      sortOrder: 7,
      variantGroup: 'morning',
    },
    {
      stableKey: 'morning_09',
      collectionType: 'morning',
      titleAr: 'اللهم ما أصبح بي من نعمة',
      textAr:
        '((اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ)).',
      referenceAr: 'رواه أبو داود',
      targetCount: 1,
      sortOrder: 8,
      variantGroup: 'morning',
    },
    {
      stableKey: 'morning_10',
      collectionType: 'morning',
      titleAr: 'اللهم عافني في بدني',
      textAr: TEXT_AAFINI_BADANI,
      referenceAr: 'رواه أبو داود (ثلاث مرات)',
      targetCount: 3,
      sortOrder: 9,
    },
    {
      stableKey: 'morning_11',
      collectionType: 'morning',
      titleAr: 'حسبي الله لا إله إلا هو',
      textAr: TEXT_HASBIYA_ALLAH,
      referenceAr: 'سبع مرات',
      targetCount: 7,
      sortOrder: 10,
    },
    {
      stableKey: 'morning_12',
      collectionType: 'morning',
      titleAr: 'اللهم إني أسألك العفو والعافية',
      textAr: TEXT_ALAFW_WALAFIYAH,
      referenceAr: 'رواه أبو داود وابن ماجه',
      targetCount: 1,
      sortOrder: 11,
    },
    {
      stableKey: 'morning_13',
      collectionType: 'morning',
      titleAr: 'اللهم عالم الغيب والشهادة',
      textAr: TEXT_ALIM_ALGHAYB,
      referenceAr: 'رواه الترمذي',
      targetCount: 1,
      sortOrder: 12,
    },
    {
      stableKey: 'morning_14',
      collectionType: 'morning',
      titleAr: 'بسم الله الذي لا يضر مع اسمه شيء',
      textAr: TEXT_BISMILLAH_LA_YADURR,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 13,
    },
    {
      stableKey: 'morning_15',
      collectionType: 'morning',
      titleAr: 'رضيت بالله رباً',
      textAr: TEXT_RADITU_BILLAH,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 14,
    },
    {
      stableKey: 'morning_16',
      collectionType: 'morning',
      titleAr: 'يا حي يا قيوم برحمتك أستغيث',
      textAr: TEXT_YA_HAYYU,
      referenceAr: 'رواه الحاكم',
      targetCount: 1,
      sortOrder: 15,
    },
    {
      stableKey: 'morning_17',
      collectionType: 'morning',
      titleAr: 'أصبحنا على فطرة الإسلام',
      textAr:
        '((أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ)).',
      referenceAr: 'رواه أحمد',
      targetCount: 1,
      sortOrder: 16,
    },
    {
      stableKey: 'morning_18',
      collectionType: 'morning',
      titleAr: 'سبحان الله وبحمده عدد خلقه',
      textAr:
        '((سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ)).',
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 17,
    },
    {
      stableKey: 'morning_19',
      collectionType: 'morning',
      titleAr: 'اللهم إني أسألك علماً نافعاً',
      textAr:
        '((اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً)).',
      referenceAr: 'رواه ابن ماجه',
      targetCount: 1,
      sortOrder: 18,
    },
    {
      stableKey: 'morning_20',
      collectionType: 'morning',
      titleAr: 'لا إله إلا الله وحده لا شريك له (عشراً أو مرة)',
      textAr: TEXT_LA_ILAHA_10_OR_1,
      referenceAr: 'عشر مرات أو مرة عند الكسل',
      targetCount: 10,
      alternativeCount: 1,
      sortOrder: 19,
    },
    {
      stableKey: 'morning_21',
      collectionType: 'morning',
      titleAr: 'سبحان الله وبحمده',
      textAr: TEXT_SUBHANALLAH_WABIHAMDIH,
      referenceAr: 'مائة مرة',
      targetCount: 100,
      sortOrder: 20,
    },
    {
      stableKey: 'morning_22',
      collectionType: 'morning',
      titleAr: 'لا إله إلا الله (مائة مرة)',
      textAr: TEXT_LA_ILAHA_100,
      referenceAr: 'مائة مرة في اليوم',
      targetCount: 100,
      sortOrder: 21,
    },
    {
      stableKey: 'morning_23',
      collectionType: 'morning',
      titleAr: 'أستغفر الله وأتوب إليه',
      textAr: TEXT_ASTAGHFIRULLAH_100,
      referenceAr: 'مائة مرة',
      targetCount: 100,
      sortOrder: 22,
    },
    {
      stableKey: 'morning_24',
      collectionType: 'morning',
      titleAr: 'الصلاة على النبي صلى الله عليه وسلم',
      textAr: TEXT_SALAT_PROPHET_10,
      referenceAr: 'عشر مرات',
      targetCount: 10,
      sortOrder: 23,
    },
    {
      stableKey: 'morning_25',
      collectionType: 'morning',
      titleAr: 'اللهم إني أعوذ بك أن أشرك بك',
      textAr:
        '((اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لاَ أَعْلَمُ)).',
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 24,
    },
  ];
  for (const r of morningRaw) items.push(makeItem(id++, r));

  // Evening (23 items)
  const eveningRaw: Array<Parameters<typeof makeItem>[1]> = [
    {
      stableKey: 'evening_01',
      collectionType: 'evening',
      titleAr: 'آية الكرسي',
      textAr: TEXT_AYAT_KURSI,
      referenceAr: 'سورة البقرة: 255',
      targetCount: 1,
      sortOrder: 0,
      isQuranic: true,
    },
    {
      stableKey: 'evening_02',
      collectionType: 'evening',
      titleAr: 'سورة الإخلاص',
      textAr: TEXT_SURAH_IKHLAS,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 1,
      isQuranic: true,
    },
    {
      stableKey: 'evening_03',
      collectionType: 'evening',
      titleAr: 'سورة الفلق',
      textAr: TEXT_SURAH_FALAQ,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 2,
      isQuranic: true,
    },
    {
      stableKey: 'evening_04',
      collectionType: 'evening',
      titleAr: 'سورة الناس',
      textAr: TEXT_SURAH_NAS,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 3,
      isQuranic: true,
    },
    {
      stableKey: 'evening_05',
      collectionType: 'evening',
      titleAr: 'أمسينا وأمسى الملك لله',
      textAr:
        '((أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ)).',
      referenceAr: 'رواه مسلم',
      targetCount: 1,
      sortOrder: 4,
      variantGroup: 'evening',
    },
    {
      stableKey: 'evening_06',
      collectionType: 'evening',
      titleAr: 'اللهم بك أمسينا',
      textAr:
        '((اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ)).',
      referenceAr: 'رواه الترمذي',
      targetCount: 1,
      sortOrder: 5,
      variantGroup: 'evening',
    },
    {
      stableKey: 'evening_07',
      collectionType: 'evening',
      titleAr: 'سيد الاستغفار',
      textAr: TEXT_SAYYID_ISTIGHFAR,
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 6,
    },
    {
      stableKey: 'evening_08',
      collectionType: 'evening',
      titleAr: 'اللهم إني أمسيت أشهدك',
      textAr:
        '((اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتِكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ)).',
      referenceAr: 'أربع مرات',
      targetCount: 4,
      sortOrder: 7,
      variantGroup: 'evening',
    },
    {
      stableKey: 'evening_09',
      collectionType: 'evening',
      titleAr: 'اللهم ما أمسى بي من نعمة',
      textAr:
        '((اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ)).',
      referenceAr: 'رواه أبو داود',
      targetCount: 1,
      sortOrder: 8,
      variantGroup: 'evening',
    },
    {
      stableKey: 'evening_10',
      collectionType: 'evening',
      titleAr: 'اللهم عافني في بدني',
      textAr: TEXT_AAFINI_BADANI,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 9,
    },
    {
      stableKey: 'evening_11',
      collectionType: 'evening',
      titleAr: 'حسبي الله لا إله إلا هو',
      textAr: TEXT_HASBIYA_ALLAH,
      referenceAr: 'سبع مرات',
      targetCount: 7,
      sortOrder: 10,
    },
    {
      stableKey: 'evening_12',
      collectionType: 'evening',
      titleAr: 'اللهم إني أسألك العفو والعافية',
      textAr: TEXT_ALAFW_WALAFIYAH,
      referenceAr: 'رواه أبو داود',
      targetCount: 1,
      sortOrder: 11,
    },
    {
      stableKey: 'evening_13',
      collectionType: 'evening',
      titleAr: 'اللهم عالم الغيب والشهادة',
      textAr: TEXT_ALIM_ALGHAYB,
      referenceAr: 'رواه الترمذي',
      targetCount: 1,
      sortOrder: 12,
    },
    {
      stableKey: 'evening_14',
      collectionType: 'evening',
      titleAr: 'بسم الله الذي لا يضر مع اسمه شيء',
      textAr: TEXT_BISMILLAH_LA_YADURR,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 13,
    },
    {
      stableKey: 'evening_15',
      collectionType: 'evening',
      titleAr: 'رضيت بالله رباً',
      textAr: TEXT_RADITU_BILLAH,
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 14,
    },
    {
      stableKey: 'evening_16',
      collectionType: 'evening',
      titleAr: 'يا حي يا قيوم برحمتك أستغيث',
      textAr: TEXT_YA_HAYYU,
      referenceAr: 'رواه الحاكم',
      targetCount: 1,
      sortOrder: 15,
    },
    {
      stableKey: 'evening_17',
      collectionType: 'evening',
      titleAr: 'أمسينا على فطرة الإسلام',
      textAr:
        '((أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ)).',
      referenceAr: 'رواه أحمد',
      targetCount: 1,
      sortOrder: 16,
    },
    {
      stableKey: 'evening_18',
      collectionType: 'evening',
      titleAr: 'أعوذ بكلمات الله التامات من شر ما خلق',
      textAr: '((أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ)).',
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 17,
    },
    {
      stableKey: 'evening_19',
      collectionType: 'evening',
      titleAr: 'لا إله إلا الله وحده لا شريك له (عشراً أو مرة)',
      textAr: TEXT_LA_ILAHA_10_OR_1,
      referenceAr: 'عشر مرات أو مرة عند الكسل',
      targetCount: 10,
      alternativeCount: 1,
      sortOrder: 18,
    },
    {
      stableKey: 'evening_20',
      collectionType: 'evening',
      titleAr: 'سبحان الله وبحمده',
      textAr: TEXT_SUBHANALLAH_WABIHAMDIH,
      referenceAr: 'مائة مرة',
      targetCount: 100,
      sortOrder: 19,
    },
    {
      stableKey: 'evening_21',
      collectionType: 'evening',
      titleAr: 'أستغفر الله وأتوب إليه',
      textAr: TEXT_ASTAGHFIRULLAH_100,
      referenceAr: 'مائة مرة',
      targetCount: 100,
      sortOrder: 20,
    },
    {
      stableKey: 'evening_22',
      collectionType: 'evening',
      titleAr: 'الصلاة على النبي صلى الله عليه وسلم',
      textAr: TEXT_SALAT_PROPHET_10,
      referenceAr: 'عشر مرات',
      targetCount: 10,
      sortOrder: 21,
    },
    {
      stableKey: 'evening_23',
      collectionType: 'evening',
      titleAr: 'اللهم إني أعوذ بك أن أشرك بك',
      textAr:
        '((اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لاَ أَعْلَمُ)).',
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 22,
    },
  ];
  for (const r of eveningRaw) items.push(makeItem(id++, r));

  // Sleep (14 items)
  const sleepRaw: Array<Parameters<typeof makeItem>[1]> = [
    {
      stableKey: 'sleep_01',
      collectionType: 'sleep',
      titleAr: 'سورة الإخلاص والفلق والناس (ثلاثاً)',
      textAr: `${TEXT_SURAH_IKHLAS}\n\n${TEXT_SURAH_FALAQ}\n\n${TEXT_SURAH_NAS}`,
      instructionsAr: 'يجمع كفيه ثم ينفث فيهما ويقرأ المعوذات ويمسح بهما ما استطاع من جسده (ثلاث مرات)',
      referenceAr: 'متفق عليه',
      targetCount: 3,
      sortOrder: 0,
      isQuranic: true,
    },
    {
      stableKey: 'sleep_02',
      collectionType: 'sleep',
      titleAr: 'آية الكرسي عند النوم',
      textAr: TEXT_AYAT_KURSI,
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 1,
      isQuranic: true,
    },
    {
      stableKey: 'sleep_03',
      collectionType: 'sleep',
      titleAr: 'خواتيم سورة البقرة',
      textAr:
        '﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ * لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾.',
      referenceAr: 'سورة البقرة: 285-286',
      targetCount: 1,
      sortOrder: 2,
      isQuranic: true,
    },
    {
      stableKey: 'sleep_04',
      collectionType: 'sleep',
      titleAr: 'باسمك ربي وضعت جنبي',
      textAr:
        '((بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ)).',
      referenceAr: 'متفق عليه',
      targetCount: 1,
      sortOrder: 3,
    },
    {
      stableKey: 'sleep_05',
      collectionType: 'sleep',
      titleAr: 'اللهم إنك خلقت نفسي وأنت توفاها',
      textAr:
        '((اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ)).',
      referenceAr: 'رواه مسلم',
      targetCount: 1,
      sortOrder: 4,
    },
    {
      stableKey: 'sleep_06',
      collectionType: 'sleep',
      titleAr: 'اللهم قني عذابك يوم تبعث عبادك',
      textAr: '((اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ)).',
      referenceAr: 'ثلاث مرات',
      targetCount: 3,
      sortOrder: 5,
    },
    {
      stableKey: 'sleep_07',
      collectionType: 'sleep',
      titleAr: 'باسمك اللهم أموت وأحيا',
      textAr: '((بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا)).',
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 6,
    },
    {
      stableKey: 'sleep_08',
      collectionType: 'sleep',
      titleAr: 'التسبيح والتحميد والتكبير عند النوم',
      textAr: '((سُبْحَانَ اللَّهِ (33)، وَالْحَمْدُ لِلَّهِ (33)، وَاللَّهُ أَكْبَرُ (34))).',
      referenceAr: 'متفق عليه',
      targetCount: 100,
      sortOrder: 7,
      groupKey: 'sleep_tasbeeh_group',
      subCountersJson: serializeSubCounters(defaultSleepTasbeehSubCounters()),
    },
    {
      stableKey: 'sleep_09',
      collectionType: 'sleep',
      titleAr: 'اللهم رب السماوات السبع',
      textAr:
        '((اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ، وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ)).',
      referenceAr: 'رواه مسلم',
      targetCount: 1,
      sortOrder: 8,
    },
    {
      stableKey: 'sleep_10',
      collectionType: 'sleep',
      titleAr: 'الحمد لله الذي أطعمنا وسقانا',
      textAr:
        '((الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ)).',
      referenceAr: 'رواه مسلم',
      targetCount: 1,
      sortOrder: 9,
    },
    {
      stableKey: 'sleep_11',
      collectionType: 'sleep',
      titleAr: 'اللهم عالم الغيب والشهادة',
      textAr: TEXT_ALIM_ALGHAYB,
      referenceAr: 'رواه أبو داود',
      targetCount: 1,
      sortOrder: 10,
    },
    {
      stableKey: 'sleep_12',
      collectionType: 'sleep',
      titleAr: 'سورة السجدة كاملة (30 آية)',
      textAr: TEXT_SURAH_AS_SAJDAH,
      referenceAr: 'كان النبي صلى الله عليه وسلم لا ينام حتى يقرأ الم تنزيل السجدة وتبارك',
      targetCount: 1,
      sortOrder: 11,
      isQuranic: true,
    },
    {
      stableKey: 'sleep_13',
      collectionType: 'sleep',
      titleAr: 'سورة الملك كاملة (30 آية)',
      textAr: TEXT_SURAH_AL_MULK,
      referenceAr: 'سورة الملك — المانعة المنجية من عذاب القبر',
      targetCount: 1,
      sortOrder: 12,
      isQuranic: true,
    },
    {
      stableKey: 'sleep_14',
      collectionType: 'sleep',
      titleAr: 'اللهم أسلمت نفسي إليك',
      textAr:
        '((اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ)).',
      referenceAr: 'متفق عليه',
      targetCount: 1,
      sortOrder: 13,
    },
  ];
  for (const r of sleepRaw) items.push(makeItem(id++, r));

  // Wakeup (4 items)
  const wakeupRaw: Array<Parameters<typeof makeItem>[1]> = [
    {
      stableKey: 'wakeup_01',
      collectionType: 'wakeup',
      titleAr: 'الحمد لله الذي أحيانا بعد ما أماتنا',
      textAr: '((الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ)).',
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 0,
    },
    {
      stableKey: 'wakeup_02',
      collectionType: 'wakeup',
      titleAr: 'التهليل والتسبيح عند التقلب ليلاً',
      textAr:
        '((لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي)).',
      referenceAr: 'رواه البخاري',
      targetCount: 1,
      sortOrder: 1,
    },
    {
      stableKey: 'wakeup_03',
      collectionType: 'wakeup',
      titleAr: 'الحمد لله الذي عافاني في جسدي',
      textAr:
        '((الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ)).',
      referenceAr: 'رواه الترمذي',
      targetCount: 1,
      sortOrder: 2,
    },
    {
      stableKey: 'wakeup_04',
      collectionType: 'wakeup',
      titleAr: 'خواتيم سورة آل عمران عند الاستيقاظ',
      textAr:
        '﴿إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ * الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ﴾.',
      referenceAr: 'سورة آل عمران: 190-191',
      targetCount: 1,
      sortOrder: 3,
      isQuranic: true,
    },
  ];
  for (const r of wakeupRaw) items.push(makeItem(id++, r));

  return items;
}

export function defaultCustomReminders(): CustomDhikrReminderEntity[] {
  return DEFAULT_CUSTOM_REMINDER_TEXTS.map((textAr, idx) => ({
    id: idx + 1,
    textAr,
    isEnabled: true,
    sortOrder: idx,
    createdAt: Date.now(),
  }));
}
