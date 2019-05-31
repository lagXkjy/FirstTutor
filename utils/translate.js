module.exports = {
  translateWeek(res) { //周
    let data;
    switch (parseInt(res)) {
      case 1:
        data = '周一';
        break;
      case 2:
        data = '周二';
        break;
      case 3:
        data = '周三';
        break;
      case 4:
        data = '周四';
        break;
      case 5:
        data = '周五';
        break;
      case 6:
        data = '周六';
        break;
      case 7:
        data = '周日';
        break;
    }
    return data;
  },
  translateWeekEn(res) { //周转英文
    let data;
    switch (parseInt(res)) {
      case 1:
        data = 'Monday';
        break;
      case 2:
        data = 'Tuesday';
        break;
      case 3:
        data = 'Wednesday';
        break;
      case 4:
        data = 'Thursday';
        break;
      case 5:
        data = 'Friday';
        break;
      case 6:
        data = 'Saturday';
        break;
      case 7:
        data = 'Sunday';
        break;
    }
    return data;
  },
  translateTime(res) { //转时间段
    let data;
    switch (parseInt(res)) {
      case 1:
        data = '上午';
        break;
      case 2:
        data = '下午1';
        break;
      case 3:
        data = '下午2';
        break;
      case 4:
        data = '晚上';
        break;
    }
    return data;
  },
  translateTimeEn(res) { //转时间段英文
    let data;
    switch (parseInt(res)) {
      case 1:
        data = 'AM';
        break;
      case 2:
        data = 'PM1';
        break;
      case 3:
        data = 'PM2';
        break;
      case 4:
        data = 'PM3';
        break;
    }
    return data;
  },
}