const SUPABASE_URL =
    "https://bwpxfmubpesasuiajyak.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d6B8rT_x88HAqmTWbxhBeQ_mR2cKLzz";


const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==============================
// 화면 요소
// ==============================

const calendar =
    document.getElementById("calendar");

const diaryImages =
    document.getElementById("diaryImages");

    const homeMemoText =
    document.getElementById(
        "homeMemoText"
    );

const defaultHomeMemo =
    "Some days,\n" +
    "the music is\n" +
    "the only thing\n" +
    "that gets me\n" +
    "through.";

function showHomeMemo(memoText) {

    if (!homeMemoText) {
        return;
    }

    homeMemoText.textContent =
        memoText || defaultHomeMemo;

    homeMemoText.classList.remove(
        "is-loading"
    );

    homeMemoText.classList.add(
        "is-ready"
    );

    homeMemoText.removeAttribute(
        "aria-busy"
    );

}

const homePlaylist =
    document.getElementById(
        "homePlaylist"
    );

const diaryContentBlocks =
    document.getElementById(
        "diaryContentBlocks"
    );
const monthList =
    document.getElementById("monthList");

const calendarYear =
    document.getElementById("calendarYear");

const calendarMonth =
    document.getElementById("calendarMonth");

const passwordModal =
    document.getElementById("passwordModal");

const modalDate =
    document.getElementById("modalDate");

const passwordInput =
    document.getElementById("passwordInput");

const passwordError =
    document.getElementById("passwordError");

const closePasswordButton =
    document.getElementById("closePassword");
const openDiaryButton =
    document.getElementById("openDiary");

const diaryModal =
    document.getElementById("diaryModal");

const closeDiaryButton =
    document.getElementById("closeDiary");

const diaryDate =
    document.getElementById("diaryDate");

const diaryTitle =
    document.getElementById("diaryTitle");

const diaryText =
    document.getElementById("diaryText");

const diaryMood =
    document.getElementById("diaryMood");

const diarySong =
    document.getElementById("diarySong");

// ==============================
// 월 이름
// ==============================

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


// Supabase에서 받아온 날짜
let diaryDates = [];


// 현재 보고 있는 연도 / 월
let currentYear;
let currentMonth;

// 현재 선택한 일기 날짜
let selectedDate = null;

// ==============================
// 일기 날짜 가져오기
// ==============================

async function loadDiaryDates() {

    const {
        data,
        error
    } = await supabaseClient
        .rpc("get_diary_dates");


    if (error) {

        console.error(
            "일기 날짜 불러오기 실패:",
            error
        );

        return;
    }


    diaryDates =
        data.map(function(item) {
            return item.entry_date;
        });


    if (diaryDates.length === 0) {

        calendarMonth.textContent =
            "No Diary";

        return;
    }


    createMonthList();


    // 가장 최근 일기가 있는 달을 처음 보여주기
    const latestDate =
        diaryDates[diaryDates.length - 1];

    const parts =
        latestDate.split("-");

    currentYear =
        Number(parts[0]);

    currentMonth =
        Number(parts[1]) - 1;


    renderCalendar(
        currentYear,
        currentMonth
    );

}

// ==============================
// 홈 화면 설정 불러오기
// ==============================

async function loadHomeSettings() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("site_settings")
            .select(
                "memo_text, playlist"
            )
            .eq(
                "id",
                1
            )
            .single();


    if (error) {

        console.error(
            "홈 화면 설정 불러오기 오류:",
            error
        );

        showHomeMemo(
            defaultHomeMemo
        );

        return;
    }


    // ==============================
    // 상단 메모
    // ==============================

    showHomeMemo(
        data.memo_text
    );


    // ==============================
    // 플레이리스트
    // ==============================

    if (!homePlaylist) {
        return;
    }


    homePlaylist.innerHTML = "";


    const playlist =
        Array.isArray(
            data.playlist
        )
            ? data.playlist
            : [];


    playlist.forEach(
        function(song, index) {

            const songElement =
                document.createElement(
                    "div"
                );

            songElement.className =
                "song";


            const number =
                document.createElement(
                    "span"
                );

            number.textContent =
                String(index + 1)
                    .padStart(
                        2,
                        "0"
                    );


            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                song.title || "";


            const artist =
                document.createElement(
                    "em"
                );

            artist.textContent =
                song.artist
                    ? `— ${song.artist}`
                    : "";


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.textContent =
                "▷";


            if (song.youtube) {

                button.addEventListener(
                    "click",
                    function() {

                        window.open(
                            song.youtube,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }
                );

            } else {

                button.disabled =
                    true;

            }


            songElement.appendChild(
                number
            );

            songElement.appendChild(
                title
            );

            songElement.appendChild(
                artist
            );

            songElement.appendChild(
                button
            );


            homePlaylist.appendChild(
                songElement
            );

        }
    );

}

// ==============================
// 일기가 있는 월 목록 만들기
// ==============================

function createMonthList() {

    monthList.innerHTML = "";


    const months = new Set();


    diaryDates.forEach(function(date) {

        const parts =
            date.split("-");

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;


        months.add(
            `${year}-${month}`
        );

    });


    Array.from(months)
        .sort()
        .forEach(function(value) {

            const [
                year,
                month
            ] =
                value
                    .split("-")
                    .map(Number);


            const button =
                document.createElement("button");

            button.className =
                "month";


            button.innerHTML = `
                <span>${year}</span>
                <strong>
                    ${month + 1}월
                </strong>
            `;


            button.addEventListener(
                "click",
                function() {

                    currentYear =
                        year;

                    currentMonth =
                        month;

                    renderCalendar(
                        year,
                        month
                    );

                    updateActiveMonth(
                        year,
                        month
                    );

                }
            );


            button.dataset.year =
                year;

            button.dataset.month =
                month;


            monthList.appendChild(
                button
            );

        });

}


// ==============================
// 선택된 월 표시
// ==============================

function updateActiveMonth(
    year,
    month
) {

    const buttons =
        document.querySelectorAll(
            ".month"
        );


    buttons.forEach(function(button) {

        button.classList.remove(
            "active"
        );


        if (
            Number(button.dataset.year)
                === year
            &&
            Number(button.dataset.month)
                === month
        ) {

            button.classList.add(
                "active"
            );

        }

    });

}


// ==============================
// 달력 만들기
// ==============================

function renderCalendar(
    year,
    month
) {

    // 요일 제목을 제외한 날짜칸 삭제
    const existingDays =
        calendar.querySelectorAll(
            ".day, .empty-day"
        );


    existingDays.forEach(function(item) {
        item.remove();
    });


    calendarYear.textContent =
        `──── ${year} ────`;

    calendarMonth.textContent =
        monthNames[month];


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // 첫 주 빈칸
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-day";

        calendar.appendChild(
            empty
        );

    }


    // 실제 날짜
    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "day";

        button.textContent =
            day;


        const monthText =
            String(month + 1)
                .padStart(2, "0");

        const dayText =
            String(day)
                .padStart(2, "0");


        const dateString =
            `${year}-${monthText}-${dayText}`;


        const hasDiary =
            diaryDates.includes(
                dateString
            );


if (hasDiary) {

    button.classList.add(
        "memory"
    );

    button.addEventListener(
        "click",
        function() {

            openPasswordModal(
                dateString
            );

        }
    );

} else {

    button.classList.add(
        "no-memory"
    );

}


        calendar.appendChild(
            button
        );

    }


    updateActiveMonth(
        year,
        month
    );

}


// ==============================
// 비밀번호 화면 열기
// ==============================

function openPasswordModal(dateString) {

    const safeDateString =
        String(dateString);

    selectedDate =
        safeDateString;

    modalDate.textContent =
        safeDateString.replaceAll(
            "-",
            " · "
        );

    passwordInput.value =
        "";

    passwordError.classList.remove(
        "show"
    );

    passwordModal.classList.add(
        "show"
    );

    setTimeout(function() {

        passwordInput.focus();

    }, 100);

}

// ==============================
// 비밀번호 확인 후 일기 열기
// ==============================

openDiaryButton.addEventListener(
    "click",
    async function() {

        const password =
            passwordInput.value;

        if (!selectedDate || password.length === 0) {
            return;
        }


        openDiaryButton.disabled = true;

        openDiaryButton.textContent =
            "OPENING...";


        const {
            data,
            error
        } = await supabaseClient.rpc(
            "unlock_diary",
            {
                requested_date:
                    selectedDate,

                supplied_password:
                    password
            }
        );


        openDiaryButton.disabled = false;

        openDiaryButton.textContent =
            "OPEN";


        if (error) {

            console.error(
                "일기 열기 오류:",
                error
            );

            passwordError.textContent =
                "일기를 불러오지 못했어요.";

            passwordError.classList.add(
                "show"
            );

            return;
        }


        if (!data || data.length === 0) {

            passwordError.textContent =
                "비밀번호가 맞지 않아요 ♡";

            passwordError.classList.add(
                "show"
            );

            return;
        }


        const diary =
            data[0];
diaryImages.innerHTML = "";

console.log("사진 함수 호출 시작");

const {
    data: imageResult,
    error: imageFunctionError
} =
    await supabaseClient.functions.invoke(
        "get-diary-images",
        {
            body: {
                requested_date:
                    selectedDate,

                supplied_password:
                    password
            }
        }
    );

console.log(
    "사진 함수 결과:",
    imageResult
);

console.log(
    "사진 함수 오류:",
    imageFunctionError
);

if (imageFunctionError) {

    console.error(
        "사진 불러오기 실패:",
        imageFunctionError
    );

} else if (
    imageResult &&
    imageResult.images
) {

    imageResult.images.forEach(
        function(imageUrl) {

            const img =
                document.createElement(
                    "img"
                );

            img.src = imageUrl;

            img.loading = "lazy";

            img.className =
                "diary-image";

            diaryImages.appendChild(
                img
            );

        }
    );

}
// ==============================
// 콘텐츠 블록 표시
// ==============================

diaryContentBlocks.innerHTML = "";

if (
    imageResult &&
    Array.isArray(
        imageResult.content_blocks
    )
) {

    imageResult.content_blocks.forEach(
        function(block) {

            // 글 블록
            if (block.type === "text") {

                const text =
                    document.createElement(
                        "div"
                    );

                text.className =
                    "diary-block-text";

                text.textContent =
                    block.content || "";

                diaryContentBlocks
                    .appendChild(text);

            }


            // 사진 블록
            if (
                block.type === "image" &&
                block.url
            ) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    block.url;

                img.loading =
                    "lazy";

                img.className =
                    "diary-block-image";

                diaryContentBlocks
                    .appendChild(img);

            }

        }
    );

}
const hasContentBlocks =
    imageResult &&
    Array.isArray(
        imageResult.content_blocks
    ) &&
    imageResult.content_blocks.length > 0;

        passwordModal.classList.remove(
            "show"
        );


        diaryDate.textContent =
            diary.entry_date.replaceAll(
                "-",
                " · "
            );


        diaryTitle.textContent =
            diary.title || "";


 // ==============================
// 모든 일기 콘텐츠 함께 표시
// ==============================

// 기존 본문
diaryText.textContent =
    diary.content || "";

if (diary.content) {

    diaryText.style.display =
        "block";

} else {

    diaryText.style.display =
        "none";

}


// 새 글/사진 블록
if (hasContentBlocks) {

    diaryContentBlocks.style.display =
        "block";

} else {

    diaryContentBlocks.style.display =
        "none";

}


// 기존 일반 첨부사진
if (
    imageResult &&
    Array.isArray(
        imageResult.images
    ) &&
    imageResult.images.length > 0
) {

    diaryImages.style.display =
        "grid";

} else {

    diaryImages.style.display =
        "none";

}


diaryMood.textContent =
    diary.mood || "♡";


diarySong.textContent =
    diary.song || "♪";


diaryModal.classList.add(
    "show"
);

    }
);
// Enter 키로도 OPEN

passwordInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            openDiaryButton.click();

        }

    }
);
// ==============================
// 창 닫기
// ==============================

closePasswordButton.addEventListener(
    "click",
    function() {

        passwordModal.classList.remove(
            "show"
        );

    }
);
// 일기 창 닫기

closeDiaryButton.addEventListener(
    "click",
    function() {

        diaryModal.classList.remove(
            "show"
        );

    }
);


diaryModal.addEventListener(
    "click",
    function(event) {

        if (event.target === diaryModal) {

            diaryModal.classList.remove(
                "show"
            );

        }

    }
);

passwordModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target
            === passwordModal
        ) {

            passwordModal.classList.remove(
                "show"
            );

        }

    }
);


// ==============================
// 시작
// ==============================

loadDiaryDates();
loadHomeSettings();
