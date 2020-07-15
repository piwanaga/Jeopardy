// GITHUB Link
// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const res = await axios.get('http://jservice.io/api/categories', {params: { count: 100}});
    const cats = _.sampleSize(res.data, 6);
    for (let cat of cats) {
        categories.push(cat.id);
    }
    return categories;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const res = await axios.get('http://jservice.io/api/category', {params: { id: catId}});
    const clueArray = [];
    const clues = res.data.clues;
    for (let clue of clues) {
        clueArray.push(
            {
                question: clue.question,
                answer: clue.answer,
                showing: null
            }
        )
    }
    return {
        title: res.data.title,
        clues: clueArray
    }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    await getCategoryIds();
    const rows = $('#jeopardyTbody tr');

    for (let category of categories) {
        let catInfo = await getCategory(category);
        let catTitle = catInfo.title.toUpperCase();
        let randomClues = _.sampleSize(catInfo.clues, 5);
        $('#jeopardyTheadTr').append(`<td>${catTitle}</td>`);
            for (let i=0; i<randomClues.length; i++) {
                $('<td>').attr({
                    'data-question': `${randomClues[i].question}`,
                    'data-answer': `${randomClues[i].answer}`,
                    'data-showing': 'null',
                }).html('?').addClass('null').appendTo(rows.eq(i));
            }
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
$('tr').on('click', 'td', handleClick)
function handleClick(e) {
    const data = e.target.dataset

    if (data.showing === 'null') {
    $(e.target).html(data.question);
    $(e.target).removeClass('null');
    data.showing = 'question'
    }
    else if (data.showing === 'question') {
    $(e.target).html(data.answer);
    $(e.target).addClass('complete');
    data.showing = 'answer'
    }
    else {
        return
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('#jeopardyTheadTr').empty();
    $('#jeopardyTbody tr').empty();
    categories = [];
    $('table').hide();
    $('#spinner').show();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#spinner').hide();
    $('table').show();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    await fillTable();
    hideLoadingView()
}

/** On click of start / restart button, set up game. */
$('#new-game-button').on('click', setupAndStart)
// TODO

/** On page load, add event handler for clicking clues */

